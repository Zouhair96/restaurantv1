import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { POSManager } from './pos-adapters/pos-manager.js';
import { getStripe } from './utils/stripe-client.js';

export const handler = async (event, context) => {
    // Allow CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const stripe = await getStripe();
        const { restaurantName, orderType, tableNumber, deliveryAddress, paymentMethod, items, totalPrice } = JSON.parse(event.body);

        // Optional: Get customer ID from token if present
        let customerId = null;
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.role === 'client') {
                    customerId = decoded.id;
                }
            } catch (err) {
                console.warn('Invalid token provided for order placement');
            }
        }

        // Validation
        if (!restaurantName || !orderType || !paymentMethod || !items || totalPrice === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        if (!['dine_in', 'take_out'].includes(orderType)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid order type' })
            };
        }

        if (!['credit_card', 'cash'].includes(paymentMethod)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid payment method' })
            };
        }

        if (orderType === 'dine_in' && !tableNumber) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Table number required for dine-in orders' })
            };
        }

        if (orderType === 'take_out' && !deliveryAddress) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Delivery address required for take-out orders' })
            };
        }

        // Find restaurant by name - robust lookup to handle duplicates
        const restaurantResult = await query(`
            SELECT u.id, u.restaurant_name 
            FROM users u
            LEFT JOIN menus m ON u.id = m.user_id
            WHERE u.restaurant_name = $1
            ORDER BY m.updated_at DESC NULLS LAST
            LIMIT 1
        `, [restaurantName]);

        if (restaurantResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Restaurant not found' })
            };
        }

        const restaurantId = restaurantResult.rows[0].id;

        // Fetch Platform Settings
        const settingsResult = await query('SELECT key, value FROM platform_settings WHERE key = $1', ['stripe_config']);
        const stripeConfig = settingsResult.rows[0]?.value || { commission_rate: 0.02, currency: 'eur' };

        const commissionRate = stripeConfig.commission_rate;
        const currency = stripeConfig.currency || 'eur';
        const commissionAmount = parseFloat(totalPrice) * commissionRate;

        // Insert order
        const orderResult = await query(
            `INSERT INTO orders (restaurant_id, order_type, table_number, delivery_address, payment_method, items, total_price, status, customer_id, commission_amount, payment_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10)
             RETURNING id, created_at`,
            [restaurantId, orderType, tableNumber, deliveryAddress, paymentMethod, JSON.stringify(items), totalPrice, customerId, commissionAmount, paymentMethod === 'cash' ? 'pending_cash' : 'pending']
        );

        const newOrder = {
            id: orderResult.rows[0].id,
            restaurant_id: restaurantId,
            order_type: orderType,
            table_number: tableNumber,
            delivery_address: deliveryAddress,
            payment_method: paymentMethod,
            items: items,
            total_price: totalPrice,
            created_at: orderResult.rows[0].created_at
        };

        // --- STRIPE CHECKOUT SESSION ---
        let checkoutUrl = null;
        if (paymentMethod === 'credit_card') {
            try {
                // Get restaurant's Stripe Account ID
                const userResult = await query('SELECT stripe_account_id, stripe_onboarding_complete FROM users WHERE id = $1', [restaurantId]);
                const restaurantUser = userResult.rows[0];

                if (restaurantUser?.stripe_account_id && restaurantUser?.stripe_onboarding_complete) {
                    const session = await stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        line_items: [{
                            price_data: {
                                currency: currency,
                                product_data: {
                                    name: `Order #${newOrder.id} - ${restaurantResult.rows[0].restaurant_name}`,
                                },
                                unit_amount: Math.round(totalPrice * 100),
                            },
                            quantity: 1,
                        }],
                        mode: 'payment',
                        success_url: `${process.env.URL || 'http://localhost:8888'}/order/${newOrder.id}?payment=success`,
                        cancel_url: `${process.env.URL || 'http://localhost:8888'}/order/${newOrder.id}?payment=cancel`,
                        payment_intent_data: {
                            application_fee_amount: Math.round(commissionAmount * 100),
                            transfer_data: {
                                destination: restaurantUser.stripe_account_id,
                            },
                        },
                        metadata: {
                            orderId: newOrder.id.toString(),
                            restaurantId: restaurantId.toString()
                        }
                    });

                    checkoutUrl = session.url;

                    // Update order with session ID
                    await query('UPDATE orders SET stripe_checkout_session_id = $1 WHERE id = $2', [session.id, newOrder.id]);
                } else {
                    console.warn('Restaurant stripe account not ready. Defaulting to Cash or Error.');
                    // Optionally throw error if CC is required
                }
            } catch (stripeError) {
                console.error('Stripe Session Error:', stripeError.message);
            }
        }

        // --- POS INTEGRATION TRIGGER ---
        // Only trigger POS sync immediately for CASH orders. 
        // For CC, we wait for Webhook (payment confirmation).
        let posStatus = { success: false, skipped: true };
        if (paymentMethod === 'cash') {
            try {
                // Update restaurant's owed balance
                await query(
                    'UPDATE users SET owed_commission_balance = COALESCE(owed_commission_balance, 0) + $1 WHERE id = $2',
                    [commissionAmount, restaurantId]
                );

                // Fetch integration settings
                const settingsResult = await query(
                    'SELECT * FROM integration_settings WHERE restaurant_id = $1',
                    [restaurantId]
                );

                if (settingsResult.rows.length > 0) {
                    const settings = settingsResult.rows[0];
                    if (settings.pos_enabled) {
                        posStatus = await POSManager.sendOrder(settings, newOrder);

                        if (posStatus.success && posStatus.external_id) {
                            await query(
                                'UPDATE orders SET external_id = $1 WHERE id = $2',
                                [posStatus.external_id, newOrder.id]
                            );
                        }
                    }
                }
            } catch (posError) {
                console.error('⚠️ POS Integration Error:', posError.message);
                posStatus = { success: false, error: posError.message };
            }
        } else {
            posStatus = { success: false, skipped: true, reason: 'Waiting for payment confirmation' };
        }

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                orderId: newOrder.id,
                message: 'Order placed successfully',
                pos_sync: posStatus,
                checkoutUrl: checkoutUrl
            })
        };

    } catch (error) {
        console.error('Submit Order Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error',
                details: error.message
            })
        };
    }
};

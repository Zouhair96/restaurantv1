import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getStripe } from './utils/stripe-client.js';
import { getNextOrderNumber } from './utils/order-number.js';

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
        // --- Middleware: Ensure Schema is ready ---
        // We add all columns that might be missing from older schemas
        try {
            const tableFixes = [
                "ADD COLUMN IF NOT EXISTS customer_id INTEGER",
                "ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10, 2) DEFAULT 0.00",
                "ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'",
                "ADD COLUMN IF NOT EXISTS loyalty_discount_applied BOOLEAN DEFAULT false",
                "ADD COLUMN IF NOT EXISTS loyalty_discount_amount NUMERIC DEFAULT 0",
                "ADD COLUMN IF NOT EXISTS loyalty_gift_item TEXT",
                "ADD COLUMN IF NOT EXISTS commission_recorded BOOLEAN DEFAULT false",
                "ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT",
                "ADD COLUMN IF NOT EXISTS loyalty_id TEXT"
            ];
            for (const fix of tableFixes) {
                await query(`ALTER TABLE orders ${fix}`).catch(e => console.warn(`[DB Patch] ${fix} failed:`, e.message));
            }
        } catch (dbErr) {
            console.warn('[DB Warning]: Could not ensure orders schema in submit-order:', dbErr.message);
        }

        const body = JSON.parse(event.body);
        const {
            restaurantName, orderType, tableNumber, deliveryAddress,
            paymentMethod, items, totalPrice,
            loyalty_discount_applied = false,
            loyalty_discount_amount = 0,
            loyalty_gift_item = null,
            loyalty_id = null
        } = body;

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

        // Relaxed validation: deliveryAddress is optional for take_out (collection at counter)

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

        // --- LOYALTY SERVER-SIDE ENFORCEMENT & FINALIZATION ---
        if (loyalty_id) {
            const visitorRes = await query(
                'SELECT * FROM loyalty_visitors WHERE restaurant_id = $1 AND device_id = $2',
                [restaurantId, loyalty_id]
            );
            const visitor = visitorRes.rows[0];

            if (visitor) {
                const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 Minutes (Match get-loyalty-status)
                const now = new Date();

                // 1. FINALIZATION (Redundant but Safe): Ensure visit_count is updated if this is a new window
                const lastSessionAt = visitor.last_session_at ? new Date(visitor.last_session_at).getTime() : 0;
                const lastCountedAt = visitor.last_counted_at ? new Date(visitor.last_counted_at).getTime() : 0;
                const timeSinceLastActivity = now.getTime() - lastSessionAt;

                const hasUncountedVisit = lastSessionAt > lastCountedAt;
                const isNewVisitWindow = timeSinceLastActivity > SESSION_TIMEOUT;

                let visitCount = parseInt(visitor.visit_count || 0);
                let ordersInSession = parseInt(visitor.orders_in_current_session || 0);

                if (hasUncountedVisit && isNewVisitWindow) {
                    const ordersCheck = await query(
                        'SELECT id FROM orders WHERE loyalty_id = $1 AND restaurant_id = $2 AND status = \'completed\' AND created_at >= $3',
                        [loyalty_id, restaurantId, visitor.last_counted_at || visitor.created_at]
                    ).catch(() => ({ rows: [1] }));

                    if (ordersCheck.rows.length > 0) {
                        visitCount++;
                        await query(
                            'UPDATE loyalty_visitors SET visit_count = $1, last_counted_at = NOW(), orders_in_current_session = 0, last_session_at = NOW() WHERE id = $2',
                            [visitCount, visitor.id]
                        );
                        ordersInSession = 0;
                    }
                } else {
                    // Just heartbeat the session
                    await query('UPDATE loyalty_visitors SET last_session_at = NOW() WHERE id = $1', [visitor.id]);
                }

                if (loyalty_id && (loyalty_discount_applied || loyalty_gift_item)) {
                    // Rule: Session 2 (visit_count 1) is ONE-TIME only
                    if (visitCount === 1 && ordersInSession > 0) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: 'Welcome discount already used in this session.' })
                        };
                    }

                    // Rule: Session 1 (visit_count 0) has NO discount
                    if (visitCount === 0) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: 'Not eligible for loyalty rewards in Session 1.' })
                        };
                    }
                }
            }
        }

        // Fetch Platform Settings
        const settingsResult = await query('SELECT key, value FROM platform_settings WHERE key = $1', ['stripe_config']);
        const stripeConfig = settingsResult.rows[0]?.value || { commission_rate: 0.02, currency: 'eur' };

        const commissionRate = stripeConfig.commission_rate;
        const currency = stripeConfig.currency || 'eur';
        const commissionAmount = parseFloat(totalPrice) * commissionRate;

        // Get restaurant's order numbering config and generate next order number
        const configResult = await query(
            'SELECT order_number_config FROM users WHERE id = $1',
            [restaurantId]
        );
        const orderNumberConfig = configResult.rows[0]?.order_number_config || {
            starting_number: 1,
            current_number: 1,
            reset_period: 'never',
            weekly_start_day: 1,
            last_reset_date: null
        };

        const { order_number, new_current, last_reset_date } = getNextOrderNumber(orderNumberConfig);

        // Update restaurant's order number config
        await query(
            `UPDATE users 
             SET order_number_config = jsonb_set(
                 jsonb_set(
                     order_number_config,
                     '{current_number}',
                     $1::text::jsonb
                 ),
                 '{last_reset_date}',
                 $2::text::jsonb
             )
             WHERE id = $3`,
            [new_current, last_reset_date ? `"${last_reset_date}"` : 'null', restaurantId]
        );

        // Insert order with null-safe parameters
        const orderResult = await query(
            `INSERT INTO orders (
                restaurant_id, order_type, table_number, delivery_address, 
                payment_method, items, total_price, status, customer_id, 
                commission_amount, payment_status, order_number,
                loyalty_discount_applied, loyalty_discount_amount, loyalty_gift_item,
                loyalty_id,
                created_at, updated_at
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
             RETURNING id, created_at`,
            [
                restaurantId,
                orderType,
                tableNumber || null,
                deliveryAddress || null,
                paymentMethod,
                JSON.stringify(items),
                totalPrice,
                customerId,
                commissionAmount,
                paymentMethod === 'cash' ? 'pending_cash' : 'pending',
                order_number,
                loyalty_discount_applied,
                loyalty_discount_amount,
                loyalty_gift_item,
                loyalty_id
            ]
        );

        const newOrder = {
            id: orderResult.rows[0].id,
            restaurant_id: restaurantId,
            restaurant_name: restaurantResult.rows[0].restaurant_name,
            order_type: orderType,
            table_number: tableNumber,
            delivery_address: deliveryAddress,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cash' ? 'pending_cash' : 'pending',
            items: items,
            total_price: totalPrice,
            created_at: orderResult.rows[0].created_at
        };

        // --- LOYALTY SESSION UPDATE ---
        // Increment session order count immediately (so UI updates message)
        if (loyalty_id) {
            await query(`
                UPDATE loyalty_visitors 
                SET orders_in_current_session = COALESCE(orders_in_current_session, 0) + 1,
                    last_session_at = NOW()
                WHERE restaurant_id = $1 AND device_id = $2
            `, [restaurantId, loyalty_id]);
        }

        // --- STRIPE CHECKOUT SESSION ---
        let checkoutUrl = null;
        if (paymentMethod === 'credit_card') {
            try {
                const stripe = await getStripe(); // LAZY LOAD STRIPE ONLY IF NEEDED
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

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                orderId: newOrder.id,
                message: 'Order placed successfully',
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

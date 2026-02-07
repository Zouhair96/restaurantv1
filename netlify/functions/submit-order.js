import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getStripe } from './utils/stripe-client.js';
import { getNextOrderNumber } from './utils/order-number.js';

dotenv.config();

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    try {
        // --- 0. Schema Maintenance ---
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
            console.warn('[DB Warning]: Could not ensure orders schema:', dbErr.message);
        }

        // --- 1. Parse & Validate Input ---
        const body = JSON.parse(event.body);
        const {
            restaurantName, orderType, tableNumber, deliveryAddress,
            paymentMethod, items, totalPrice,
            loyalty_discount_applied = false,
            loyalty_discount_amount = 0,
            loyalty_gift_item = null,
            loyalty_gift_id = null,
            convertToPoints = false,
            loyaltyId = null // Fallback
        } = body;

        const finalLoyaltyId = loyalty_id || loyaltyId;

        if (!restaurantName || !orderType || !paymentMethod || !items || totalPrice === undefined) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        // --- 2. Resolve Identifiers ---
        let customerId = null;
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
                if (decoded.role === 'client') customerId = decoded.id;
            } catch (err) { console.warn('Invalid token in submit-order'); }
        }

        const restaurantResult = await query(`
            SELECT u.id, u.restaurant_name 
            FROM users u
            LEFT JOIN menus m ON u.id = m.user_id
            WHERE u.restaurant_name = $1
            ORDER BY m.updated_at DESC NULLS LAST
            LIMIT 1
        `, [restaurantName]);

        if (restaurantResult.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Restaurant not found' }) };
        }
        const restaurantId = restaurantResult.rows[0].id;

        // Fetch Global Config
        const settingsResult = await query('SELECT key, value FROM platform_settings WHERE key = $1', ['stripe_config']);
        const stripeConfig = settingsResult.rows[0]?.value || { commission_rate: 0.02, currency: 'eur' };
        const commissionRate = stripeConfig.commission_rate;
        const currency = stripeConfig.currency || 'eur';
        const commissionAmount = parseFloat(totalPrice) * commissionRate;

        // --- 3. CORE TRANSACTIONAL LOGIC ---
        let newOrderId = null;
        let orderDate = null;
        let generatedOrderNumber = null;

        await query('BEGIN');
        try {
            // A. Loyalty Visit Finalization (Steps 1 & 2)
            if (finalLoyaltyId) {
                // Ensure visitor exists and increment session order count with timeout check
                const vRes = await query('SELECT id, orders_in_current_session, last_visit_at FROM loyalty_visitors WHERE restaurant_id = $1 AND device_id = $2 FOR UPDATE', [restaurantId, finalLoyaltyId]);
                if (vRes.rows.length === 0) {
                    await query('INSERT INTO loyalty_visitors (restaurant_id, device_id, orders_in_current_session, last_visit_at) VALUES ($1, $2, 1, NOW())', [restaurantId, finalLoyaltyId]);
                } else {
                    const visitor = vRes.rows[0];
                    const lastVisit = visitor.last_visit_at ? new Date(visitor.last_visit_at) : null;
                    const now = new Date();
                    const sessionTimeout = 2 * 60 * 1000; // 2 minutes

                    if (lastVisit && (now - lastVisit > sessionTimeout)) {
                        // NEW SESSION: Start from 1
                        await query('UPDATE loyalty_visitors SET orders_in_current_session = 1, last_visit_at = NOW() WHERE id = $1', [visitor.id]);
                    } else {
                        // CONTINUING SESSION: Increment
                        await query('UPDATE loyalty_visitors SET orders_in_current_session = COALESCE(orders_in_current_session, 0) + 1, last_visit_at = NOW() WHERE id = $1', [visitor.id]);
                    }
                }
            }

            // B. Order Number Generation
            const nrConfigRes = await query('SELECT order_number_config FROM users WHERE id = $1 FOR UPDATE', [restaurantId]);
            const nrConfig = nrConfigRes.rows[0]?.order_number_config || { starting_number: 1, current_number: 1, reset_period: 'never', weekly_start_day: 1, last_reset_date: null };
            const { order_number, new_current, last_reset_date } = getNextOrderNumber(nrConfig);
            generatedOrderNumber = order_number;

            await query(`UPDATE users SET order_number_config = jsonb_set(jsonb_set(order_number_config, '{current_number}', $1::text::jsonb), '{last_reset_date}', $2::text::jsonb) WHERE id = $3`,
                [new_current, last_reset_date ? `"${last_reset_date}"` : 'null', restaurantId]);

            // C. Insert Order (Step 3)
            const orderRes = await query(`
                INSERT INTO orders (
                    restaurant_id, order_type, table_number, delivery_address, payment_method, 
                    items, total_price, status, customer_id, commission_amount, payment_status, 
                    order_number, loyalty_discount_applied, loyalty_discount_amount, loyalty_gift_item, 
                    loyalty_id, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
                RETURNING id, created_at
            `, [restaurantId, orderType, tableNumber || null, deliveryAddress || null, paymentMethod, JSON.stringify(items), totalPrice, customerId, commissionAmount, paymentMethod === 'cash' ? 'pending_cash' : 'pending', order_number, loyalty_discount_applied, loyalty_discount_amount, loyalty_gift_item, finalLoyaltyId]);

            newOrderId = orderRes.rows[0].id;
            orderDate = orderRes.rows[0].created_at;

            // D. Lifecycle Attachment
            if (loyalty_gift_id) {
                if (convertToPoints) {
                    // Update only order_id, keep status unused for conversion tool
                    await query('UPDATE gifts SET order_id = $1 WHERE id = $2 AND device_id = $3', [newOrderId, loyalty_gift_id, loyalty_id]);
                } else {
                    // Mark as consumed immediately
                    await query('UPDATE gifts SET order_id = $1, status = \'consumed\' WHERE id = $2 AND device_id = $3', [newOrderId, loyalty_gift_id, loyalty_id]);
                }
            }

            await query('COMMIT');
        } catch (txErr) {
            await query('ROLLBACK').catch(() => { });
            throw txErr;
        }

        // --- 4. Post-Transaction (Conversion, Stripe & Response) ---
        if (convertToPoints && loyalty_gift_id) {
            try {
                const fetch = (await import('node-fetch')).default;
                const baseUrl = process.env.URL || 'http://localhost:8888';
                await fetch(`${baseUrl}/.netlify/functions/convert-gift-to-points`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ giftId: loyalty_gift_id, loyaltyId: loyalty_id, restaurantId: restaurantId })
                });
            } catch (convErr) {
                console.error('[Conversion Trigger Failed]:', convErr.message);
            }
        }

        let checkoutUrl = null;
        if (paymentMethod === 'credit_card') {
            try {
                const stripe = await getStripe();
                const uRes = await query('SELECT stripe_account_id, stripe_onboarding_complete FROM users WHERE id = $1', [restaurantId]);
                const restaurantUser = uRes.rows[0];

                if (restaurantUser?.stripe_account_id && restaurantUser?.stripe_onboarding_complete) {
                    const session = await stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        line_items: [{
                            price_data: {
                                currency: currency,
                                product_data: { name: `Order #${newOrderId} - ${restaurantResult.rows[0].restaurant_name}` },
                                unit_amount: Math.round(totalPrice * 100),
                            },
                            quantity: 1,
                        }],
                        mode: 'payment',
                        success_url: `${process.env.URL || 'http://localhost:8888'}/order/${newOrderId}?payment=success`,
                        cancel_url: `${process.env.URL || 'http://localhost:8888'}/order/${newOrderId}?payment=cancel`,
                        payment_intent_data: {
                            application_fee_amount: Math.round(commissionAmount * 100),
                            transfer_data: { destination: restaurantUser.stripe_account_id },
                        },
                        metadata: { orderId: newOrderId.toString(), restaurantId: restaurantId.toString() }
                    });
                    checkoutUrl = session.url;
                    await query('UPDATE orders SET stripe_checkout_session_id = $1 WHERE id = $2', [session.id, newOrderId]);
                }
            } catch (stripeErr) { console.error('Stripe Error:', stripeErr.message); }
        }

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                orderId: newOrderId,
                message: 'Order placed successfully',
                checkoutUrl: checkoutUrl
            })
        };

    } catch (globalErr) {
        console.error('Final Submit Error:', globalErr);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: globalErr.message })
        };
    }
};

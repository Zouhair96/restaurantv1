import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'PATCH, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'PATCH') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // --- Middleware: Ensure Schema is ready ---
        try {
            await query(`
                ALTER TABLE orders 
                ADD COLUMN IF NOT EXISTS commission_recorded BOOLEAN DEFAULT false,
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            `);

            // Ensure loyalty_visitors has last_counted_at
            await query(`
                ALTER TABLE loyalty_visitors 
                ADD COLUMN IF NOT EXISTS last_counted_at TIMESTAMP WITH TIME ZONE,
                ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMP WITH TIME ZONE
            `);
        } catch (dbErr) {
            console.warn('[DB Warning]: Could not ensure schemas:', dbErr.message);
        }

        // Verify JWT token
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized: Missing token' })
            };
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET missing");

        const decoded = jwt.verify(token, secret);

        // ADMIN has bypass, OWNER and STAFF are restricted to their restaurant_id
        const restaurantId = (decoded.role === 'ADMIN') ? null : decoded.restaurant_id;

        const { orderId, status } = JSON.parse(event.body);

        // Validation
        if (!orderId || !status) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing orderId or status' })
            };
        }

        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled', 'out_for_delivery'];
        if (!validStatuses.includes(status)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid status' })
            };
        }

        // 1. Fetch order details to verify ownership and check state for STAF restrictions
        const checkResult = await query(
            'SELECT id, restaurant_id, status, loyalty_id, device_id, customer_id, total_price, created_at FROM orders WHERE id = $1',
            [orderId]
        );

        if (checkResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Order not found' })
            };
        }

        const order = checkResult.rows[0];

        // 2. SECURITY CHECK: Restaurant Ownership
        if (decoded.role !== 'ADMIN' && order.restaurant_id !== restaurantId) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Forbidden: Access denied to this restaurant\'s orders' })
            };
        }

        // 3. SECURITY CHECK: STAFF Restrictions
        if (decoded.role === 'STAFF') {
            // Cannot cancel completed orders
            if (status === 'cancelled' && order.status === 'completed') {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: 'Forbidden: Staff cannot cancel completed orders' })
                };
            }
        }

        // Update order status and handle commission recording for acceptance
        let updateResult;

        if (status === 'preparing') {
            // Check if already accepted to avoid double billing
            const orderCheck = await query(
                'SELECT commission_recorded, commission_amount FROM orders WHERE id = $1',
                [orderId]
            );

            const alreadyRecorded = orderCheck.rows[0]?.commission_recorded;
            const commissionAmount = orderCheck.rows[0]?.commission_amount || 0;

            let updateQuery = `
                UPDATE orders 
                SET status = $1, 
                    updated_at = CURRENT_TIMESTAMP,
                    commission_recorded = TRUE
                WHERE id = $2 
                RETURNING id, status, updated_at, commission_recorded
            `;
            updateResult = await query(updateQuery, [status, orderId]);

            // If this is the first time it's being accepted, update the restaurant's balance
            if (!alreadyRecorded && commissionAmount > 0) {
                await query(
                    'UPDATE users SET owed_commission_balance = COALESCE(owed_commission_balance, 0) + $1 WHERE id = $2',
                    [commissionAmount, order.restaurant_id]
                );
            }
        } else if (status === 'cancelled') {
            // --- 2-FREE-CANCELLATION POLICY ---
            // 1. Get count of cancellations today
            const cancelCountResult = await query(
                `SELECT COUNT(*) FROM orders 
                 WHERE restaurant_id = $1 AND status = 'cancelled' 
                 AND updated_at >= CURRENT_DATE`,
                [order.restaurant_id]
            );
            const cancelCount = parseInt(cancelCountResult.rows[0].count);

            // 2. Get order details to see if it was already billed
            const orderInfo = await query(
                'SELECT commission_recorded, commission_amount FROM orders WHERE id = $1',
                [orderId]
            );
            const wasRecorded = orderInfo.rows[0]?.commission_recorded;
            const commissionAmount = orderInfo.rows[0]?.commission_amount || 0;

            // 3. Update status
            updateResult = await query(
                `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 
                 RETURNING id, status, updated_at`,
                [status, orderId]
            );

            let message = "Order cancelled.";

            // --- LOYALTY ROLLBACK ---
            if (order.loyalty_id || order.device_id) {
                const loyaltyId = order.loyalty_id || order.device_id;
                console.log(`[Loyalty Rollback] Reversing progress for visitor: ${loyaltyId}`);

                await query(`
                    UPDATE loyalty_visitors 
                    SET orders_in_current_session = GREATEST(0, COALESCE(orders_in_current_session, 1) - 1)
                    WHERE restaurant_id = $1 AND device_id = $2
                `, [order.restaurant_id, loyaltyId]);

                // Also update last_visit_at to the most recent OTHER completed order if it exists
                await query(`
                    UPDATE loyalty_visitors 
                    SET last_visit_at = (
                        SELECT created_at FROM orders 
                        WHERE loyalty_id = $1 AND restaurant_id = $2 AND status = 'completed' AND id != $3
                        ORDER BY created_at DESC LIMIT 1
                    )
                    WHERE restaurant_id = $2 AND device_id = $1
                `, [loyaltyId, order.restaurant_id, orderId]);
            }

            // 4. Handle refund logic
            if (cancelCount < 2) {
                // Within free limit - refund if it was billed
                if (wasRecorded && commissionAmount > 0) {
                    await query(
                        'UPDATE users SET owed_commission_balance = GREATEST(0, COALESCE(owed_commission_balance, 0) - $1) WHERE id = $2',
                        [commissionAmount, order.restaurant_id]
                    );
                    message += " Commission was refunded (Daily free limit).";
                }
            } else {
                // Limit exceeded - no refund
                message += " We will still collect our 2% commission for this order. Tomorrow, your '2 Free Cancellations' limit will reset.";
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    order: updateResult.rows[0],
                    message: message
                })
            };
        } else if (status === 'completed') {
            const prevStatus = order.status;
            const loyaltyId = order.loyalty_id || order.device_id;
            const orderRestaurantId = order.restaurant_id;

            // --- ENTITY-BASED LOYALTY SYSTEM: COMPLETION HOOK ---
            if (loyaltyId && prevStatus !== 'completed') {
                await query('BEGIN');
                try {
                    // 1. Get or Create Visitor Profile
                    let visitorRes = await query(
                        'SELECT * FROM loyalty_visitors WHERE restaurant_id = $1 AND device_id = $2 FOR UPDATE',
                        [orderRestaurantId, loyaltyId]
                    );
                    let visitor = visitorRes.rows[0];
                    if (!visitor) {
                        const insertRes = await query(`
                            INSERT INTO loyalty_visitors (restaurant_id, device_id, visit_count, total_points, orders_in_current_session, last_visit_at)
                            VALUES ($1, $2, 0, 0, 0, NOW())
                            RETURNING *
                        `, [orderRestaurantId, loyaltyId]);
                        visitor = insertRes.rows[0];
                    }

                    // 2. IDEMPOTENCY CHECK: Ensure we haven't processed points for this order
                    const existingTx = await query(
                        'SELECT id FROM points_transactions WHERE order_id = $1 FOR UPDATE',
                        [orderId]
                    );

                    if (existingTx.rows.length === 0) {
                        const userRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [orderRestaurantId]);
                        const config = userRes.rows[0]?.loyalty_config || {};

                        // --- POINT EARNING ---
                        if (config.points_system_enabled !== false) {
                            const ppe = parseInt(config.points_per_euro) || 1;
                            const earnedPoints = Math.floor(parseFloat(order.total_price || 0) * ppe);

                            if (earnedPoints > 0) {
                                await query(`
                                    INSERT INTO points_transactions (restaurant_id, device_id, order_id, type, amount, created_at)
                                    VALUES ($1, $2, $3, 'EARN', $4, NOW())
                                `, [orderRestaurantId, loyaltyId, orderId, earnedPoints]);

                                await query(`
                                    UPDATE loyalty_visitors SET total_points = COALESCE(total_points, 0) + $1 WHERE id = $2
                                `, [earnedPoints, visitor.id]);
                            }
                        }

                        // --- VISIT COUNTING & REWARD PROVISIONING ---
                        // Rule: Start a "new visit" if THIS order's creation time is > 2 mins after the PREVIOUS completed order
                        const prevOrderRes = await query(`
                            SELECT created_at FROM orders 
                            WHERE (loyalty_id = $1 OR device_id = $1) AND restaurant_id = $2 AND status = 'completed' AND id != $3
                            ORDER BY created_at DESC LIMIT 1
                        `, [loyaltyId, orderRestaurantId, orderId]);

                        const lastVisitCompletion = prevOrderRes.rows[0]?.created_at ? new Date(prevOrderRes.rows[0].created_at) : null;
                        const thisOrderCreation = new Date(order.created_at);
                        const sessionTimeout = 2 * 60 * 1000; // 2 minutes
                        const isNewVisit = !lastVisitCompletion || (thisOrderCreation - lastVisitCompletion > sessionTimeout);

                        if (isNewVisit) {
                            const newVisitCount = parseInt(visitor.visit_count || 0) + 1;

                            // Provisioning Logic
                            if (newVisitCount === 1) {
                                // Just completed Session 1 -> Provision Welcome Discount for Session 2
                                const welcomeVal = config.welcome_discount_value || 10;
                                await query(`
                                    INSERT INTO gifts (restaurant_id, device_id, type, percentage_value, status)
                                    VALUES ($1, $2, 'PERCENTAGE', $3, 'unused')
                                `, [orderRestaurantId, loyaltyId, welcomeVal]);
                            } else if (newVisitCount === 3) {
                                // Just completed Session 3 -> Provision Loyal Reward for Session 4+
                                const rewardType = config.reward_type === 'item' ? 'FIXED_VALUE' : 'PERCENTAGE';
                                const rewardVal = config.reward_value || (rewardType === 'FIXED_VALUE' ? 2 : 15);

                                await query(`
                                    INSERT INTO gifts (restaurant_id, device_id, type, euro_value, percentage_value, status)
                                    VALUES ($1, $2, $3, $4, $5, 'unused')
                                `, [
                                    orderRestaurantId,
                                    loyaltyId,
                                    rewardType,
                                    rewardType === 'FIXED_VALUE' ? rewardVal : 0,
                                    rewardType === 'PERCENTAGE' ? rewardVal : 0
                                ]);
                            }

                            await query(`
                                UPDATE loyalty_visitors 
                                SET visit_count = $1, orders_in_current_session = 1, last_visit_at = NOW()
                                WHERE id = $2
                            `, [newVisitCount, visitor.id]);
                        } else {
                            // Subsequent order in same session
                            await query(`
                                UPDATE loyalty_visitors 
                                SET orders_in_current_session = COALESCE(orders_in_current_session, 0) + 1,
                                    last_visit_at = NOW()
                                WHERE id = $1
                            `, [visitor.id]);
                        }
                    }

                    await query('COMMIT');
                } catch (err) {
                    await query('ROLLBACK').catch(() => { });
                    console.error('[Loyalty Completion Error]:', err.message);
                }
            }

            // Finally update the order status itself
            let updateQuery = `
                UPDATE orders 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 
                RETURNING id, status, updated_at
            `;
            updateResult = await query(updateQuery, [status, orderId]);
        }
        else {
            // Standard update for other statuses
            let updateQuery = `
                UPDATE orders 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 
                RETURNING id, status, updated_at
            `;
            updateResult = await query(updateQuery, [status, orderId]);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                order: updateResult.rows[0]
            })
        };

    } catch (error) {
        console.error('Update Order Status Error:', error);

        if (error.name === 'JsonWebTokenError') {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }

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

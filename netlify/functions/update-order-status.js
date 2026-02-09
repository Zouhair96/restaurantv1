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

            // Ensure gifts has granted_by_order_id
            await query(`
                ALTER TABLE gifts 
                ADD COLUMN IF NOT EXISTS granted_by_order_id INTEGER
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
            'SELECT id, restaurant_id, status, loyalty_id, customer_id, total_price, created_at FROM orders WHERE id = $1',
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
            if (order.loyalty_id) {
                const loyaltyId = order.loyalty_id;
                const prevStatus = order.status;
                console.log(`[Loyalty Rollback] Reversing progress for visitor: ${loyaltyId} (from status: ${prevStatus})`);

                // 1. Return consumed gifts to 'unused'
                await query(`
                        UPDATE gifts 
                        SET status = 'unused', order_id = NULL 
                        WHERE order_id = $1 AND device_id = $2
                    `, [orderId, loyaltyId]);

                // 1b. Reverse converted gifts (gift-to-points conversions)
                // Find any gifts that were converted during this order's checkout
                const convertedGiftsRes = await query(`
                    SELECT g.id, pt.amount 
                    FROM gifts g
                    JOIN points_transactions pt ON pt.gift_id = g.id
                    WHERE g.device_id = $1 AND g.restaurant_id = $2 
                    AND g.status = 'converted'
                    AND pt.type = 'CONVERT_GIFT'
                    AND pt.created_at >= (SELECT created_at FROM orders WHERE id = $3)
                    AND pt.created_at <= (SELECT created_at FROM orders WHERE id = $3) + INTERVAL '5 minutes'
                `, [loyaltyId, order.restaurant_id, orderId]);

                if (convertedGiftsRes.rows.length > 0) {
                    console.log(`[Loyalty Rollback] Reversing ${convertedGiftsRes.rows.length} converted gift(s)`);

                    for (const conv of convertedGiftsRes.rows) {
                        // Remove the conversion points
                        await query(`
                            UPDATE loyalty_visitors 
                            SET total_points = GREATEST(0, COALESCE(total_points, 0) - $1) 
                            WHERE restaurant_id = $2 AND device_id = $3
                        `, [conv.amount, order.restaurant_id, loyaltyId]);

                        // Delete the conversion transaction
                        await query('DELETE FROM points_transactions WHERE gift_id = $1', [conv.id]);

                        // Restore gift to unused
                        await query(`UPDATE gifts SET status = 'unused' WHERE id = $1`, [conv.id]);

                        console.log(`[Loyalty Rollback] Restored gift ${conv.id}, removed ${conv.amount} points`);
                    }
                }


                // 2. Rollback session order count
                await query(`
                        UPDATE loyalty_visitors 
                        SET orders_in_current_session = GREATEST(0, COALESCE(orders_in_current_session, 1) - 1)
                        WHERE restaurant_id = $1 AND device_id = $2
                    `, [order.restaurant_id, loyaltyId]);

                // 3. Rollback Visit Timestamp
                await query(`
                        UPDATE loyalty_visitors 
                        SET last_visit_at = (
                            SELECT created_at FROM orders 
                            WHERE loyalty_id = $1 AND restaurant_id = $2 AND status = 'completed' AND id != $3
                            ORDER BY created_at DESC LIMIT 1
                        )
                        WHERE restaurant_id = $2 AND device_id = $1
                    `, [loyaltyId, order.restaurant_id, orderId]);

                // 4. Handle transition from COMPLETED to CANCELLED (Revoke points and granted gifts)
                if (prevStatus === 'completed') {
                    console.log(`[Loyalty Rollback] Order was COMPLETED. Reversing points and revoking granted gifts.`);

                    // A. Calculate points to reverse
                    const pointsRes = await query('SELECT SUM(amount) as total FROM points_transactions WHERE order_id = $1', [orderId]);
                    const pointsToReverse = parseInt(pointsRes.rows[0]?.total || 0);

                    if (pointsToReverse > 0) {
                        await query(`
                                UPDATE loyalty_visitors 
                                SET total_points = GREATEST(0, COALESCE(total_points, 0) - $1) 
                                WHERE restaurant_id = $2 AND device_id = $3
                            `, [pointsToReverse, order.restaurant_id, loyaltyId]);

                        await query('DELETE FROM points_transactions WHERE order_id = $1', [orderId]);
                    }

                    // B. Revoke granted gifts (only if still unused)
                    await query(`
                            DELETE FROM gifts 
                            WHERE granted_by_order_id = $1 AND status = 'unused'
                        `, [orderId]);
                }
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
            const loyaltyId = order.loyalty_id;
            const orderRestaurantId = order.restaurant_id;

            // --- ENTITY-BASED LOYALTY SYSTEM: COMPLETION HOOK ---
            if (loyaltyId && prevStatus !== 'completed') {
                const { getClient } = await import('./db.js');
                const client = await getClient();

                try {
                    await client.query('BEGIN');

                    // 1. Get or Create Visitor Profile
                    console.log(`[Loyalty] Processing completion for order ${orderId}, loyaltyId: ${loyaltyId}`);

                    let visitorRes = await client.query(
                        'SELECT id, visit_count, orders_in_current_session, last_visit_at FROM loyalty_visitors WHERE restaurant_id = $1 AND device_id = $2 FOR UPDATE',
                        [orderRestaurantId, loyaltyId]
                    );

                    let visitor = visitorRes.rows[0];
                    if (!visitor) {
                        const insertRes = await client.query(`
                            INSERT INTO loyalty_visitors (restaurant_id, device_id, visit_count, total_points, orders_in_current_session, last_visit_at)
                            VALUES ($1, $2, 0, 0, 0, NOW())
                            RETURNING id, visit_count, orders_in_current_session, last_visit_at
                        `, [orderRestaurantId, loyaltyId]);
                        visitor = insertRes.rows[0];
                        console.log(`[Loyalty] Created new visitor ${visitor.id}`);
                    }

                    // 2. IDEMPOTENCY CHECK: Ensure we haven't processed points for this order
                    const existingTx = await client.query(
                        'SELECT id FROM points_transactions WHERE order_id = $1 FOR UPDATE',
                        [orderId]
                    );

                    if (existingTx.rows.length === 0) {
                        const userRes = await client.query('SELECT loyalty_config FROM users WHERE id = $1', [orderRestaurantId]);
                        const config = userRes.rows[0]?.loyalty_config || {};

                        // --- POINT EARNING ---
                        if (config.points_system_enabled !== false) {
                            const ppe = parseInt(config.points_per_euro) || 1;
                            const earnedPoints = Math.floor(parseFloat(order.total_price || 0) * ppe);

                            if (earnedPoints > 0) {
                                await client.query(`
                                    INSERT INTO points_transactions (restaurant_id, device_id, order_id, type, amount, created_at)
                                    VALUES ($1, $2, $3, 'EARN', $4, NOW())
                                `, [orderRestaurantId, loyaltyId, orderId, earnedPoints]);

                                await client.query(`
                                    UPDATE loyalty_visitors SET total_points = COALESCE(total_points, 0) + $1 WHERE id = $2
                                `, [earnedPoints, visitor.id]);
                            }
                        }

                        // --- VISIT COUNTING & REWARD PROVISIONING ---
                        const prevOrderRes = await client.query(`
                            SELECT created_at FROM orders 
                            WHERE loyalty_id = $1 AND restaurant_id = $2 AND status = 'completed' AND id != $3
                            ORDER BY created_at DESC LIMIT 1
                        `, [loyaltyId, orderRestaurantId, orderId]);

                        const lastVisitCompletion = prevOrderRes.rows[0]?.created_at ? new Date(prevOrderRes.rows[0].created_at) : null;
                        const thisOrderCreation = new Date(order.created_at);
                        const sessionTimeout = 1 * 60 * 1000; // 1 minute

                        const isNewVisit = !lastVisitCompletion || (thisOrderCreation - lastVisitCompletion > sessionTimeout) || (parseInt(visitor.visit_count || 0) === 0);

                        console.log(`[Loyalty] isNewVisit: ${isNewVisit}, lastVisitComp: ${lastVisitCompletion}, currentVisits: ${visitor.visit_count}`);

                        if (isNewVisit) {
                            const newVisitCount = parseInt(visitor.visit_count || 0) + 1;
                            console.log(`[Loyalty] Incrementing visit_count to: ${newVisitCount}`);

                            // Visit 1: Welcome Gift
                            if (newVisitCount === 1) {
                                // Support both old and new config structures
                                const welcomeVal = parseInt(config.welcomeConfig?.value || config.welcome_discount_value) || 10;
                                await client.query(`
                                    INSERT INTO gifts (restaurant_id, device_id, type, percentage_value, euro_value, status, granted_by_order_id)
                                    VALUES ($1, $2, 'PERCENTAGE', $3, 0.00, 'unused', $4)
                                `, [orderRestaurantId, loyaltyId, welcomeVal, orderId]);
                            }

                            // --- SPENDING THRESHOLD REWARD LOGIC ---
                            // Only applies from Session 4+ (Visit Count 3+)
                            if (newVisitCount >= 3) {
                                // Check if this order pushes them over the threshold
                                const spendRes = await client.query(`
                                    SELECT SUM(total_price) as total FROM orders 
                                    WHERE restaurant_id = $1 AND loyalty_id = $2 AND status = 'completed'
                                `, [orderRestaurantId, loyaltyId]);

                                // Note: We need to add the current order manually as it's not 'completed' in DB yet
                                const previousSpending = parseFloat(spendRes.rows[0]?.total || 0);
                                const currentOrderTotal = parseFloat(order.total_price || 0);
                                const totalSpending = previousSpending + currentOrderTotal;

                                const threshold = parseFloat(config.loyalConfig?.threshold || 50);

                                console.log(`[Loyalty] Checking Spending Trigger. Total: ${totalSpending}, Threshold: ${threshold}`);

                                // Check active gifts to prevent duplicates (RECURRING CHECK)
                                // Only block if they currently have an UNUSED gift of this type
                                const giftCheck = await client.query(`
                                    SELECT id FROM gifts 
                                    WHERE restaurant_id = $1 AND device_id = $2 
                                    AND type IN ('PERCENTAGE', 'FIXED_VALUE') 
                                    AND (percentage_value = $3 OR euro_value = $4)
                                    AND status = 'unused'
                                `, [orderRestaurantId, loyaltyId,
                                    (config.loyalConfig?.type === 'item' ? 0 : (parseInt(config.loyalConfig?.value) || 15)),
                                    (config.loyalConfig?.type === 'item' ? (parseInt(config.loyalConfig?.value) || 0) : 0)
                                ]);

                                if (totalSpending >= threshold && giftCheck.rows.length === 0) {
                                    console.log('[Loyalty] Spending Threshold Reached! Granting Loyal Gift.');
                                    const rType = config.loyalConfig?.type || config.reward_type;
                                    const rVal = config.loyalConfig?.value || config.reward_value;

                                    let rewardType = 'PERCENTAGE';
                                    if (rType === 'item') {
                                        rewardType = 'ITEM';
                                    } else if (rType === 'fixed') {
                                        rewardType = 'FIXED_VALUE';
                                    }

                                    const rewardVal = (rewardType === 'ITEM') ? 0 : (parseInt(rVal) || 15);
                                    const giftName = (rewardType === 'ITEM') ? rVal : null;

                                    // For ITEM gifts, look up the current price to store as euro_value
                                    let itemPrice = 0;
                                    if (rewardType === 'ITEM' && giftName) {
                                        try {
                                            const priceRes = await client.query(`
                                                SELECT price FROM (
                                                    SELECT DISTINCT ON (name)
                                                        COALESCE(io.name_override, ti.name) as name,
                                                        COALESCE(io.price_override, ti.price) as price
                                                    FROM restaurant_templates rt
                                                    JOIN templates t ON rt.template_id = t.id
                                                    LEFT JOIN template_items ti ON ti.template_id = t.id AND ti.is_deleted = false
                                                    LEFT JOIN item_overrides io ON io.template_item_id = ti.id AND io.restaurant_id = rt.restaurant_id
                                                    WHERE rt.restaurant_id = $1 AND rt.status = 'active'
                                                    
                                                    UNION
                                                    
                                                    SELECT name_override as name, price_override as price
                                                    FROM item_overrides
                                                    WHERE restaurant_id = $1 AND template_item_id IS NULL
                                                ) menu_lookup WHERE name = $2
                                            `, [orderRestaurantId, giftName]);

                                            if (priceRes.rows.length > 0) {
                                                itemPrice = parseFloat(priceRes.rows[0].price || 0);
                                                console.log(`[Loyalty] Found item price for "${giftName}": ${itemPrice}€`);
                                            } else {
                                                console.warn(`[Loyalty] Item "${giftName}" not found in menu, euro_value will be 0`);
                                            }
                                        } catch (priceErr) {
                                            console.warn('[Loyalty] Price lookup failed:', priceErr.message);
                                        }
                                    }

                                    await client.query(`
                                        INSERT INTO gifts (restaurant_id, device_id, type, euro_value, percentage_value, gift_name, status, granted_by_order_id)
                                        VALUES ($1, $2, $3, $4, $5, $6, 'unused', $7)
                                    `, [
                                        orderRestaurantId,
                                        loyaltyId,
                                        rewardType,
                                        rewardType === 'FIXED_VALUE' ? rewardVal : (rewardType === 'ITEM' ? itemPrice : 0),
                                        rewardType === 'PERCENTAGE' ? rewardVal : 0,
                                        giftName,
                                        orderId
                                    ]);
                                }
                            }

                            await client.query(`
                                UPDATE loyalty_visitors 
                                SET visit_count = $1, orders_in_current_session = 1, last_visit_at = NOW()
                                WHERE id = $2
                            `, [newVisitCount, visitor.id]);
                        } else {
                            await client.query(`
                                UPDATE loyalty_visitors 
                                SET orders_in_current_session = COALESCE(orders_in_current_session, 0) + 1,
                                    last_visit_at = NOW()
                                WHERE id = $1
                            `, [visitor.id]);
                        }

                        await client.query('COMMIT');
                    }
                } catch (err) { // FIXED BRACE HERE
                    await client.query('ROLLBACK').catch(() => { });
                    console.error('[Loyalty Completion Error]:', err.message);
                } finally {
                    client.release();
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

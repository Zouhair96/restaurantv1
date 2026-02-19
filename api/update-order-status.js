import { query, getClient } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // --- Middleware: Ensure Schema is ready ---
        try {
            await query(`
                ALTER TABLE orders 
                ADD COLUMN IF NOT EXISTS commission_recorded BOOLEAN DEFAULT false,
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            `);
            await query(`
                ALTER TABLE loyalty_visitors 
                ADD COLUMN IF NOT EXISTS last_counted_at TIMESTAMP WITH TIME ZONE,
                ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMP WITH TIME ZONE
            `);
            await query(`
                ALTER TABLE gifts 
                ADD COLUMN IF NOT EXISTS granted_by_order_id INTEGER
            `);
        } catch (dbErr) {
            console.warn('[DB Warning]: Could not ensure schemas:', dbErr.message);
        }

        // Verify JWT token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, secret);
        const restaurantId = (decoded.role === 'ADMIN') ? null : decoded.restaurant_id;

        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ error: 'Missing orderId or status' });
        }

        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled', 'out_for_delivery'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const checkResult = await query(
            'SELECT id, restaurant_id, status, loyalty_id, customer_id, total_price, created_at FROM orders WHERE id = $1',
            [orderId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = checkResult.rows[0];

        if (decoded.role !== 'ADMIN' && order.restaurant_id !== restaurantId) {
            return res.status(403).json({ error: 'Forbidden: Access denied' });
        }

        if (decoded.role === 'STAFF') {
            if (status === 'cancelled' && order.status === 'completed') {
                return res.status(403).json({ error: 'Forbidden: Staff cannot cancel completed orders' });
            }
        }

        let updateResult;

        if (status === 'preparing') {
            const orderCheck = await query(
                'SELECT commission_recorded, commission_amount FROM orders WHERE id = $1',
                [orderId]
            );

            const alreadyRecorded = orderCheck.rows[0]?.commission_recorded;
            const commissionAmount = orderCheck.rows[0]?.commission_amount || 0;

            updateResult = await query(`
                UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP, commission_recorded = TRUE
                WHERE id = $2 RETURNING id, status, updated_at, commission_recorded
            `, [status, orderId]);

            if (!alreadyRecorded && commissionAmount > 0) {
                await query(
                    'UPDATE users SET owed_commission_balance = COALESCE(owed_commission_balance, 0) + $1 WHERE id = $2',
                    [commissionAmount, order.restaurant_id]
                );
            }
        } else if (status === 'cancelled') {
            const cancelCountResult = await query(
                `SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status = 'cancelled' AND updated_at >= CURRENT_DATE`,
                [order.restaurant_id]
            );
            const cancelCount = parseInt(cancelCountResult.rows[0].count);

            const orderInfo = await query('SELECT commission_recorded, commission_amount FROM orders WHERE id = $1', [orderId]);
            const wasRecorded = orderInfo.rows[0]?.commission_recorded;
            const commissionAmount = orderInfo.rows[0]?.commission_amount || 0;

            updateResult = await query(
                `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status, updated_at`,
                [status, orderId]
            );

            let message = "Order cancelled.";

            if (order.loyalty_id) {
                const loyaltyId = order.loyalty_id;
                const prevStatus = order.status;

                await query(`UPDATE gifts SET status = 'unused', order_id = NULL WHERE order_id = $1 AND device_id = $2`, [orderId, loyaltyId]);

                const convertedGiftsRes = await query(`
                    SELECT g.id, pt.amount FROM gifts g JOIN points_transactions pt ON pt.gift_id = g.id
                    WHERE g.device_id = $1 AND g.restaurant_id = $2 AND g.status = 'converted' AND pt.type = 'CONVERT_GIFT'
                    AND pt.created_at >= (SELECT created_at FROM orders WHERE id = $3)
                    AND pt.created_at <= (SELECT created_at FROM orders WHERE id = $3) + INTERVAL '5 minutes'
                `, [loyaltyId, order.restaurant_id, orderId]);

                for (const conv of convertedGiftsRes.rows) {
                    await query(`UPDATE loyalty_visitors SET total_points = GREATEST(0, COALESCE(total_points, 0) - $1) WHERE restaurant_id = $2 AND device_id = $3`, [conv.amount, order.restaurant_id, loyaltyId]);
                    await query('DELETE FROM points_transactions WHERE gift_id = $1', [conv.id]);
                    await query(`UPDATE gifts SET status = 'unused' WHERE id = $1`, [conv.id]);
                }

                await query(`UPDATE loyalty_visitors SET orders_in_current_session = GREATEST(0, COALESCE(orders_in_current_session, 1) - 1) WHERE restaurant_id = $1 AND device_id = $2`, [order.restaurant_id, loyaltyId]);
                await query(`
                    UPDATE loyalty_visitors SET last_visit_at = (SELECT created_at FROM orders WHERE loyalty_id = $1 AND restaurant_id = $2 AND status = 'completed' AND id != $3 ORDER BY created_at DESC LIMIT 1)
                    WHERE restaurant_id = $2 AND device_id = $1
                `, [loyaltyId, order.restaurant_id, orderId]);

                if (prevStatus === 'completed') {
                    const pointsRes = await query('SELECT SUM(amount) as total FROM points_transactions WHERE order_id = $1', [orderId]);
                    const pointsToReverse = parseInt(pointsRes.rows[0]?.total || 0);
                    if (pointsToReverse > 0) {
                        await query(`UPDATE loyalty_visitors SET total_points = GREATEST(0, COALESCE(total_points, 0) - $1) WHERE restaurant_id = $2 AND device_id = $3`, [pointsToReverse, order.restaurant_id, loyaltyId]);
                        await query('DELETE FROM points_transactions WHERE order_id = $1', [orderId]);
                    }
                    await query(`DELETE FROM gifts WHERE granted_by_order_id = $1 AND status = 'unused'`, [orderId]);
                }
            }

            if (cancelCount < 2) {
                if (wasRecorded && commissionAmount > 0) {
                    await query('UPDATE users SET owed_commission_balance = GREATEST(0, COALESCE(owed_commission_balance, 0) - $1) WHERE id = $2', [commissionAmount, order.restaurant_id]);
                    message += " Commission refunded.";
                }
            } else {
                message += " Commission still collected (limit exceeded).";
            }

            return res.status(200).json({ success: true, order: updateResult.rows[0], message });
        } else if (status === 'completed') {
            const prevStatus = order.status;
            const loyaltyId = order.loyalty_id;
            const orderRestaurantId = order.restaurant_id;

            if (loyaltyId && prevStatus !== 'completed') {
                const client = await getClient();
                try {
                    await client.query('BEGIN');
                    let visitorRes = await client.query('SELECT id, visit_count, orders_in_current_session, last_visit_at FROM loyalty_visitors WHERE restaurant_id = $1 AND device_id = $2 FOR UPDATE', [orderRestaurantId, loyaltyId]);
                    let visitor = visitorRes.rows[0];
                    if (!visitor) {
                        const insertRes = await client.query('INSERT INTO loyalty_visitors (restaurant_id, device_id, visit_count, total_points, orders_in_current_session, last_visit_at) VALUES ($1, $2, 0, 0, 0, NOW()) RETURNING id, visit_count, orders_in_current_session, last_visit_at', [orderRestaurantId, loyaltyId]);
                        visitor = insertRes.rows[0];
                    }

                    const existingTx = await client.query('SELECT id FROM points_transactions WHERE order_id = $1 FOR UPDATE', [orderId]);
                    if (existingTx.rows.length === 0) {
                        const userRes = await client.query('SELECT loyalty_config FROM users WHERE id = $1', [orderRestaurantId]);
                        const config = userRes.rows[0]?.loyalty_config || {};

                        if (config.points_system_enabled !== false) {
                            const ppe = parseInt(config.points_per_euro) || 1;
                            const earnedPoints = Math.floor(parseFloat(order.total_price || 0) * ppe);
                            if (earnedPoints > 0) {
                                await client.query('INSERT INTO points_transactions (restaurant_id, device_id, order_id, type, amount, created_at) VALUES ($1, $2, $3, \'EARN\', $4, NOW())', [orderRestaurantId, loyaltyId, orderId, earnedPoints]);
                                await client.query('UPDATE loyalty_visitors SET total_points = COALESCE(total_points, 0) + $1 WHERE id = $2', [earnedPoints, visitor.id]);
                            }
                        }

                        const prevOrderRes = await client.query('SELECT created_at FROM orders WHERE loyalty_id = $1 AND restaurant_id = $2 AND status = \'completed\' AND id != $3 ORDER BY created_at DESC LIMIT 1', [loyaltyId, orderRestaurantId, orderId]);
                        const lastVisitCompletion = prevOrderRes.rows[0]?.created_at ? new Date(prevOrderRes.rows[0].created_at) : null;
                        const thisOrderCreation = new Date(order.created_at);
                        const isNewVisit = !lastVisitCompletion || (thisOrderCreation - lastVisitCompletion > 60000) || (parseInt(visitor.visit_count || 0) === 0);

                        if (isNewVisit) {
                            const newVisitCount = parseInt(visitor.visit_count || 0) + 1;
                            if (newVisitCount === 1) {
                                const welcomeVal = parseInt(config.welcomeConfig?.value || config.welcome_discount_value) || 10;
                                await client.query('INSERT INTO gifts (restaurant_id, device_id, type, percentage_value, euro_value, status, granted_by_order_id) VALUES ($1, $2, \'PERCENTAGE\', $3, 0.00, \'unused\', $4)', [orderRestaurantId, loyaltyId, welcomeVal, orderId]);
                            }
                            if (newVisitCount >= 3) {
                                const spendRes = await client.query('SELECT SUM(total_price) as total FROM orders WHERE restaurant_id = $1 AND loyalty_id = $2 AND status = \'completed\'', [orderRestaurantId, loyaltyId]);
                                const totalPlusCurrent = parseFloat(spendRes.rows[0]?.total || 0) + parseFloat(order.total_price || 0);
                                const threshold = parseFloat(config.loyalConfig?.threshold || 50);

                                if (totalPlusCurrent >= threshold) {
                                    const rType = config.loyalConfig?.type || config.reward_type;
                                    const rVal = config.loyalConfig?.value || config.reward_value;
                                    let rewardType = (rType === 'item') ? 'ITEM' : (rType === 'fixed' ? 'FIXED_VALUE' : 'PERCENTAGE');
                                    let giftName = (rewardType === 'ITEM') ? rVal : null;
                                    await client.query('INSERT INTO gifts (restaurant_id, device_id, type, euro_value, percentage_value, gift_name, status, granted_by_order_id) VALUES ($1, $2, $3, $4, $5, $6, \'unused\', $7)', [orderRestaurantId, loyaltyId, rewardType, 0, (rewardType === 'PERCENTAGE' ? parseInt(rVal) : 0), giftName, orderId]);
                                }
                            }
                            await client.query('UPDATE loyalty_visitors SET visit_count = $1, orders_in_current_session = 1, last_visit_at = NOW() WHERE id = $2', [newVisitCount, visitor.id]);
                        } else {
                            await client.query('UPDATE loyalty_visitors SET orders_in_current_session = COALESCE(orders_in_current_session, 0) + 1, last_visit_at = NOW() WHERE id = $1', [visitor.id]);
                        }
                    }
                    await client.query('COMMIT');
                } catch (err) {
                    await client.query('ROLLBACK').catch(() => { });
                    console.error('[Loyalty Completion Error]:', err.message);
                } finally {
                    client.release();
                }
            }
            updateResult = await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status, updated_at', [status, orderId]);
        } else {
            updateResult = await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status, updated_at', [status, orderId]);
        }

        return res.status(200).json({ success: true, order: updateResult.rows[0] });

    } catch (error) {
        console.error('Update Order Status Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

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
        const restaurantId = decoded.id;

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

        // Verify order belongs to this restaurant
        const checkResult = await query(
            'SELECT id FROM orders WHERE id = $1 AND restaurant_id = $2',
            [orderId, restaurantId]
        );

        if (checkResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Order not found or access denied' })
            };
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
                    [commissionAmount, restaurantId]
                );
            }
        } else if (status === 'cancelled') {
            // --- 2-FREE-CANCELLATION POLICY ---
            // 1. Get count of cancellations today
            const cancelCountResult = await query(
                `SELECT COUNT(*) FROM orders 
                 WHERE restaurant_id = $1 AND status = 'cancelled' 
                 AND updated_at >= CURRENT_DATE`,
                [restaurantId]
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

            // 4. Handle refund logic
            if (cancelCount < 2) {
                // Within free limit - refund if it was billed
                if (wasRecorded && commissionAmount > 0) {
                    await query(
                        'UPDATE users SET owed_commission_balance = GREATEST(0, COALESCE(owed_commission_balance, 0) - $1) WHERE id = $2',
                        [commissionAmount, restaurantId]
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
            // --- LOYALTY LOGIC: Increment visit count on first completion of session ---
            const orderInfo = await query(
                'SELECT loyalty_id, restaurant_id, status FROM orders WHERE id = $1',
                [orderId]
            );
            const { loyalty_id: loyaltyId, restaurant_id: orderRestaurantId, status: prevStatus } = orderInfo.rows[0] || {};

            // Update order status
            let updateQuery = `
                UPDATE orders 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 
                RETURNING id, status, updated_at
            `;
            updateResult = await query(updateQuery, [status, orderId]);

            // ONLY process loyalty if moving to completed for the FIRST time
            if (loyaltyId && prevStatus !== 'completed') {
                const visitorRes = await query(
                    'SELECT * FROM loyalty_visitors WHERE restaurant_id = $1 AND device_id = $2',
                    [orderRestaurantId, loyaltyId]
                );
                const visitor = visitorRes.rows[0];

                if (visitor) {
                    const now = new Date();
                    // --- STRICT EXPLOIT-SAFE SESSION TRACKING ---
                    // On completion: record that an order happened in this session window
                    // and update the last_visit_at timestamp for later finalization.
                    await query(`
                        UPDATE loyalty_visitors 
                        SET 
                            last_visit_at = NOW(),
                            last_session_at = NOW(),
                            orders_in_current_session = COALESCE(orders_in_current_session, 0) + 1
                        WHERE id = $1
                    `, [visitor.id]);

                    // Record event for dashboard analytics if they hit Loyal tier (Legacy/Display support)
                    if (visitor.visit_count >= 3) {
                        await query(
                            'INSERT INTO visitor_events (restaurant_id, visitor_uuid, event_type, created_at) VALUES ($1, $2, $3, NOW())',
                            [orderRestaurantId, loyaltyId, 'loyal_status_reached']
                        );
                    }
                }
            }
        } else {
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

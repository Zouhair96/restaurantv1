import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
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

        // --- AUTO-ACCEPTANCE ROUTINE (Marketing First Strategy) ---
        // Find pending orders older than 15 minutes
        const autoAcceptResult = await query(
            `SELECT id, commission_amount FROM orders 
             WHERE restaurant_id = $1 AND status = 'pending' 
             AND created_at < NOW() - INTERVAL '15 minutes'`,
            [restaurantId]
        );

        if (autoAcceptResult.rows.length > 0) {
            console.log(`[AUTO-ACCEPT] Processing ${autoAcceptResult.rows.length} orders for restaurant ${restaurantId}`);
            for (const order of autoAcceptResult.rows) {
                // Update order to preparing and mark as auto-accepted
                await query(
                    `UPDATE orders SET 
                     status = 'preparing', 
                     accepted_at = created_at + INTERVAL '15 minutes', 
                     is_auto_accepted = TRUE, 
                     commission_recorded = TRUE, 
                     updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $1`,
                    [order.id]
                );

                // Update restaurant commission balance
                if (order.commission_amount > 0) {
                    await query(
                        'UPDATE users SET owed_commission_balance = COALESCE(owed_commission_balance, 0) + $1 WHERE id = $2',
                        [order.commission_amount, restaurantId]
                    );
                }
            }
        }
        // ------------------------------------------------------------

        // Get orders for this restaurant
        const result = await query(
            `SELECT id, order_type, table_number, delivery_address, payment_method, items, total_price, status, created_at, updated_at, driver_name, driver_phone, payment_status, commission_amount
             FROM orders
             WHERE restaurant_id = $1
             ORDER BY created_at DESC`,
            [restaurantId]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                orders: result.rows
            })
        };

    } catch (error) {
        console.error(' [GET-ORDERS DEBUG] Full Error:', error);

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

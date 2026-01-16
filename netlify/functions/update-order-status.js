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

        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
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

        // Update order status
        const updateResult = await query(
            `UPDATE orders 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, order_type, table_number, delivery_address, payment_method, items, total_price, status, created_at, updated_at`,
            [status, orderId]
        );

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

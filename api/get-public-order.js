import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const orderId = event.queryStringParameters?.orderId;

        if (!orderId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Order ID is required' })
            };
        }

        // Fetch order details (public - no auth required)
        const result = await query(
            `SELECT id, status, total_price, created_at, updated_at, order_type, table_number, items
             FROM orders
             WHERE id = $1`,
            [orderId]
        );

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Order not found' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.rows[0])
        };

    } catch (error) {
        console.error('Get Public Order Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

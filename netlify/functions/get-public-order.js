import { query } from './db.js';

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

    const { orderId } = event.queryStringParameters || {};

    if (!orderId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing orderId' })
        };
    }

    try {
        const result = await query(`
            SELECT 
                o.id, 
                o.status, 
                o.created_at, 
                o.total_price, 
                o.items, 
                o.order_type,
                o.table_number,
                u.restaurant_name
            FROM orders o
            JOIN users u ON o.restaurant_id = u.id
            WHERE o.id = $1
        `, [orderId]);

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Order not found' })
            };
        }

        const order = result.rows[0];

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ order })
        };

    } catch (error) {
        console.error('Get Order Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

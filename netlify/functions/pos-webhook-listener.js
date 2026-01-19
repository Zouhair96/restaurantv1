import { query } from './db.js';
import { validateApiKey } from './pos-adapters/auth-util.js';

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const apiKey = event.headers['x-api-key'] || event.headers['X-API-KEY'];
        const restaurantId = await validateApiKey(apiKey);

        if (!restaurantId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid API Key' }) };
        }

        const { orderId, externalId, status, notes } = JSON.parse(event.body);

        if ((!orderId && !externalId) || !status) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields (orderId or externalId and status)' }) };
        }

        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid status' }) };
        }

        // Find order by platform ID or external ID
        let orderResult;
        if (orderId) {
            orderResult = await query(
                'SELECT id FROM orders WHERE id = $1 AND restaurant_id = $2',
                [orderId, restaurantId]
            );
        } else {
            orderResult = await query(
                'SELECT id FROM orders WHERE external_id = $1 AND restaurant_id = $2',
                [externalId, restaurantId]
            );
        }

        if (orderResult.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Order not found' }) };
        }

        const actualOrderId = orderResult.rows[0].id;

        // Update order status
        await query(
            `UPDATE orders 
             SET status = $1, updated_at = NOW() 
             WHERE id = $2`,
            [status, actualOrderId]
        );

        console.log(`✅ Webhook: Order ${actualOrderId} updated to ${status} by POS`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `Order ${actualOrderId} status updated to ${status}`
            })
        };

    } catch (error) {
        console.error('Webhook Listener Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};

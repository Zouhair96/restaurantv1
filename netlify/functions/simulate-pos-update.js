import { query } from './db.js';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { orderId, status, restaurantId } = JSON.parse(event.body);

        if (!orderId || !status || !restaurantId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
        }

        // 1. Fetch integration settings to see where to send the "webhook" 
        // In a real scenario, the POS calls US. 
        // But in this simulator, WE act as the POS and call OUR OWN update-order-status endpoint
        // or directly update the DB to simulate the POS action.

        const result = await query(
            'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND restaurant_id = $3 RETURNING *',
            [status, orderId, restaurantId]
        );

        if (result.rowCount === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: "Order not found" }) };
        }

        // 2. Here we could also simulate sending a webhook to the URL configured in settings
        // if the user wants to test THEIR own endpoint.

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "POS update simulated successfully",
                order: result.rows[0]
            })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

import { query } from './db.js';
import jwt from 'jsonwebtoken';

const getUserFromToken = (headers) => {
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return null;
    }
};

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const user = getUserFromToken(event.headers);
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    try {
        const { orderId, status } = JSON.parse(event.body);
        const restaurantId = user.id;

        if (!orderId || !status) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
        }

        // Verify integration is enabled
        const settingsResult = await query(
            'SELECT pos_enabled, pos_webhook_url FROM integration_settings WHERE restaurant_id = $1',
            [restaurantId]
        );

        if (settingsResult.rows.length === 0 || !settingsResult.rows[0].pos_enabled) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "POS Integration is not enabled or configured" })
            };
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

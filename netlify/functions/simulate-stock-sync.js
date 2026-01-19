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
        const { itemId, isAvailable } = JSON.parse(event.body);
        const restaurantId = user.id;

        if (!itemId || isAvailable === undefined) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
        }

        // Verify integration is enabled
        const settingsResult = await query(
            'SELECT stock_enabled, stock_sync_url FROM integration_settings WHERE restaurant_id = $1',
            [restaurantId]
        );

        if (settingsResult.rows.length === 0 || !settingsResult.rows[0].stock_enabled) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Stock Integration is not enabled or configured" })
            };
        }

        const result = await query(
            'UPDATE generated_menu_items SET is_available = $1, updated_at = NOW() WHERE id = $2 AND menu_id IN (SELECT id FROM generated_menus WHERE user_id = $3) RETURNING *',
            [isAvailable, itemId, restaurantId]
        );

        if (result.rowCount === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: "Item not found or not owned by restaurant" }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Stock sync simulated successfully",
                item: result.rows[0]
            })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

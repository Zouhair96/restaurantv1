import { query } from './db.js';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { itemId, isAvailable, restaurantId } = JSON.parse(event.body);

        if (!itemId || isAvailable === undefined || !restaurantId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
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

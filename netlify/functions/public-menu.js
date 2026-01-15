import { query } from './db.js';

export const handler = async (event, context) => {
    // Enable CORS for public access
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { restaurantName } = event.queryStringParameters || {};

        if (!restaurantName) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Restaurant name is required' })
            };
        }

        // 1. Find the user ID by restaurant_name (case insensitive search could be better, but exact for now)
        // We handle spaces/URL decoding automatically via built-in URL decoding, but SQL match should be exact or similar
        const userResult = await query(
            'SELECT id, restaurant_name, subscription_status FROM users WHERE restaurant_name = $1',
            [restaurantName]
        );

        if (userResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Restaurant not found' })
            };
        }

        const user = userResult.rows[0];

        // 2. Fetch the most recent menu for this user
        // In the future, we might want a specific "is_published" flag, but for now we take the latest updated one.
        const menuResult = await query(
            'SELECT * FROM menus WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [user.id]
        );

        if (menuResult.rows.length === 0) {
            return {
                statusCode: 404, // or 200 with empty indication
                headers,
                body: JSON.stringify({
                    restaurant: user.restaurant_name,
                    message: 'No menus published yet.'
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                restaurant: user.restaurant_name,
                menu: menuResult.rows[0]
            })
        };

    } catch (error) {
        console.error('Public Menu API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

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

        // 1. Find the user ID by restaurant_name
        // We join with menus to prioritize users who actually have a menu if duplicates exist
        const result = await query(`
            SELECT u.id, u.restaurant_name, m.id as menu_id
            FROM users u
            LEFT JOIN menus m ON u.id = m.user_id
            WHERE u.restaurant_name = $1
            ORDER BY m.updated_at DESC NULLS LAST
            LIMIT 1
        `, [restaurantName]);

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Restaurant not found' })
            };
        }

        const user = result.rows[0];

        if (!user.menu_id) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'No menus published yet.',
                    restaurant: user.restaurant_name
                })
            };
        }

        // 2. Fetch the actual menu details
        const menuResult = await query(
            'SELECT * FROM menus WHERE id = $1',
            [user.menu_id]
        );

        if (menuResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'No menus published yet.',
                    restaurant: user.restaurant_name
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

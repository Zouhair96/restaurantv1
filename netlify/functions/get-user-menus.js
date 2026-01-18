import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { userId } = event.queryStringParameters || {};

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'User ID is required' }),
            };
        }

        // Get all menus for the user
        const menus = await sql`
            SELECT 
                id, menu_name, slug, status, thumbnail_url, 
                created_at, updated_at,
                (SELECT COUNT(*) FROM generated_menu_items WHERE menu_id = generated_menus.id) as items_count
            FROM generated_menus
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                menus: menus,
            }),
        };
    } catch (error) {
        console.error('Error fetching menus:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch menus', details: error.message }),
        };
    }
};

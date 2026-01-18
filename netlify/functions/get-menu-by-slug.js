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
        const { slug } = event.queryStringParameters || {};

        if (!slug) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Menu slug is required' }),
            };
        }

        // Get menu
        const [menu] = await sql`
            SELECT * FROM generated_menus
            WHERE slug = ${slug} AND status = 'active'
        `;

        if (!menu) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Menu not found' }),
            };
        }

        // Get menu items
        const items = await sql`
            SELECT * FROM generated_menu_items
            WHERE menu_id = ${menu.id} AND is_available = true
            ORDER BY sort_order ASC, id ASC
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                menu: menu,
                items: items,
            }),
        };
    } catch (error) {
        console.error('Error fetching menu:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch menu', details: error.message }),
        };
    }
};

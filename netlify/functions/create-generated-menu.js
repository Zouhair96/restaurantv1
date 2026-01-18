import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { userId, menuName, photos, extractedData } = JSON.parse(event.body);

        if (!userId || !menuName || !photos || photos.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }

        // Create URL-friendly slug
        const slug = menuName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug already exists
        const existingMenu = await sql`
            SELECT id FROM generated_menus WHERE slug = ${slug}
        `;

        if (existingMenu.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Menu with this name already exists' }),
            };
        }

        // Insert menu
        const [menu] = await sql`
            INSERT INTO generated_menus (user_id, menu_name, slug, original_photos, thumbnail_url)
            VALUES (${userId}, ${menuName}, ${slug}, ${JSON.stringify(photos)}, ${photos[0]})
            RETURNING *
        `;

        // Insert menu items if extracted data is provided
        if (extractedData && extractedData.items && extractedData.items.length > 0) {
            for (let i = 0; i < extractedData.items.length; i++) {
                const item = extractedData.items[i];
                await sql`
                    INSERT INTO generated_menu_items (
                        menu_id, name, description, category,
                        price_small, price_medium, price_large,
                        image_url, badge, sort_order
                    )
                    VALUES (
                        ${menu.id},
                        ${item.name},
                        ${item.description || ''},
                        ${item.category || 'classic'},
                        ${item.prices?.small || item.price || 0},
                        ${item.prices?.medium || item.price || 0},
                        ${item.prices?.large || item.price || 0},
                        ${item.image_url || ''},
                        ${item.badge || null},
                        ${i}
                    )
                `;
            }
        }

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                menu: menu,
                message: 'Menu created successfully',
            }),
        };
    } catch (error) {
        console.error('Error creating menu:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to create menu', details: error.message }),
        };
    }
};

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
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL is not set in environment variables');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error: DATABASE_URL missing' }),
            };
        }

        const body = JSON.parse(event.body);
        const { userId, menuName, photos, extractedData } = body;
        const theme = extractedData?.suggestedTheme || 'orange';

        console.log('Action: Create Menu', { userId, menuName, theme, photoCount: photos?.length });

        if (!userId || !menuName || !photos || photos.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields',
                    details: 'Ensure userId, menuName, and at least one photo are provided.'
                }),
            };
        }

        // Create URL-friendly slug
        const slug = menuName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug already exists
        let existingMenu;
        try {
            existingMenu = await sql`
                SELECT id FROM generated_menus WHERE slug = ${slug}
            `;
        } catch (checkError) {
            console.error('Error checking existing menu:', checkError);
            throw new Error(`Database check failed: ${checkError.message}`);
        }

        if (existingMenu && existingMenu.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: `A menu with the slug "${slug}" already exists.` }),
            };
        }

        // Insert menu
        const userIdInt = parseInt(userId);
        if (isNaN(userIdInt)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: `Invalid User ID: "${userId}". Must be a number.` }),
            };
        }

        let menu;
        try {
            const results = await sql`
                INSERT INTO generated_menus (user_id, menu_name, slug, original_photos, thumbnail_url, theme)
                VALUES (${userIdInt}, ${menuName}, ${slug}, ${photos}, ${photos[0]}, ${theme})
                RETURNING *
            `;
            menu = results[0];

            if (!menu) {
                throw new Error('Insert completed but no record was returned from database.');
            }
        } catch (dbError) {
            console.error('Database INSERT INTO generated_menus failed:', dbError);
            throw new Error(`Menu creation failed: ${dbError.message}`);
        }

        // Insert menu items if extracted data is provided
        if (extractedData && extractedData.items && extractedData.items.length > 0) {
            console.log(`Inserting ${extractedData.items.length} menu items...`);
            for (let i = 0; i < extractedData.items.length; i++) {
                const item = extractedData.items[i];
                try {
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
                } catch (itemError) {
                    console.error(`Warning: Failed to insert menu item index ${i}:`, itemError);
                }
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
        console.error('Critical Function Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error during menu creation',
                message: error.message,
                stack: error.stack
            }),
        };
    }
};

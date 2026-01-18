import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { action, itemId, itemData, menuId } = body;

        if (!action) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Action is required' }),
            };
        }

        switch (action) {
            case 'add':
                if (!menuId || !itemData) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Menu ID and item data are required for adding' }) };
                }
                const [newItem] = await sql`
                    INSERT INTO generated_menu_items (
                        menu_id, name, description, category,
                        price_small, price_medium, price_large,
                        image_url, badge, sort_order
                    )
                    VALUES (
                        ${menuId},
                        ${itemData.name},
                        ${itemData.description || ''},
                        ${itemData.category || 'classic'},
                        ${Number(itemData.price_small) || 0},
                        ${Number(itemData.price_medium) || 0},
                        ${Number(itemData.price_large) || 0},
                        ${itemData.image_url || ''},
                        ${itemData.badge || null},
                        ${itemData.sort_order || 0}
                    )
                    RETURNING *
                `;
                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({ success: true, item: newItem }),
                };

            case 'update':
                if (!itemId || !itemData) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Item ID and item data are required for updating' }) };
                }
                const [updatedItem] = await sql`
                    UPDATE generated_menu_items
                    SET 
                        name = ${itemData.name},
                        description = ${itemData.description || ''},
                        category = ${itemData.category || 'classic'},
                        price_small = ${Number(itemData.price_small) || 0},
                        price_medium = ${Number(itemData.price_medium) || 0},
                        price_large = ${Number(itemData.price_large) || 0},
                        image_url = ${itemData.image_url || ''},
                        badge = ${itemData.badge || null},
                        is_available = ${itemData.is_available ?? true},
                        sort_order = ${itemData.sort_order || 0},
                        updated_at = NOW()
                    WHERE id = ${itemId}
                    RETURNING *
                `;
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, item: updatedItem }),
                };

            case 'delete':
                if (!itemId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Item ID is required for deleting' }) };
                }
                await sql`
                    DELETE FROM generated_menu_items
                    WHERE id = ${itemId}
                `;
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, message: 'Item deleted successfully' }),
                };

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid action' }),
                };
        }
    } catch (error) {
        console.error('Error managing menu items:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to manage menu items', details: error.message }),
        };
    }
};

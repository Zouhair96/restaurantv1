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
            SELECT u.id, u.restaurant_name, u.stripe_onboarding_complete, m.id as menu_id
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

        // 2. Fetch the restaurant's menu instance
        const menuResult = await query(
            'SELECT * FROM menus WHERE id = $1',
            [user.menu_id]
        );
        const menuInstance = menuResult.rows[0];

        // 3. Fetch Base Template items
        const templateRes = await query(
            'SELECT * FROM templates WHERE template_key = $1',
            [menuInstance.template_type]
        );

        if (templateRes.rows.length === 0) {
            // Fallback for legacy menus that don't use templates correctly
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    restaurant: user.restaurant_name,
                    stripe_enabled: user.stripe_onboarding_complete,
                    menu: menuInstance
                })
            };
        }

        const template = templateRes.rows[0];
        const baseItemsRes = await query(
            'SELECT * FROM template_items WHERE template_id = $1 ORDER BY sort_order, id',
            [template.id]
        );
        const baseItems = baseItemsRes.rows;

        // 4. Fetch Restaurant Overrides
        const overridesRes = await query(
            'SELECT * FROM item_overrides WHERE restaurant_id = $1 AND template_item_id IN (SELECT id FROM template_items WHERE template_id = $2)',
            [user.id, template.id]
        );
        const overrides = overridesRes.rows;

        // 5. Merge with Fallback Logic
        const items = baseItems
            .map(baseItem => {
                const override = overrides.find(o => o.template_item_id === baseItem.id);
                if (override) {
                    if (override.is_hidden) return null;
                    return {
                        ...baseItem,
                        name: override.name_override || baseItem.name,
                        description: override.description_override || baseItem.description,
                        price: override.price_override || baseItem.price,
                        image_url: override.image_override || baseItem.image_url,
                        has_override: true
                    };
                }
                return { ...baseItem, has_override: false };
            })
            .filter(Boolean);

        // Construct response matching expected format
        const finalConfig = {
            ...menuInstance.config,
            items: items,
            restaurantName: menuInstance.config?.restaurantName || user.restaurant_name
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                restaurant: user.restaurant_name,
                stripe_enabled: user.stripe_onboarding_complete,
                menu: {
                    ...menuInstance,
                    config: finalConfig
                }
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

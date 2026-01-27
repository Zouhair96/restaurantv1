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

        // 1. Find the User and their Active Template Instance
        const result = await query(`
            SELECT u.id as user_id, u.restaurant_name, u.stripe_onboarding_complete, 
                   rt.id as rt_id, rt.template_id, rt.status as rt_status,
                   t.template_key, t.config as template_config, t.base_layout
            FROM users u
            JOIN restaurant_templates rt ON u.id = rt.restaurant_id
            JOIN templates t ON rt.template_id = t.id
            WHERE u.restaurant_name = $1 AND rt.status = 'active' AND t.status = 'active'
            ORDER BY rt.created_at DESC
            LIMIT 1
        `, [restaurantName]);

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'No active menu found for this restaurant' })
            };
        }

        const data = result.rows[0];

        // 2. Fetch the "Menu" record for settings (Theme, Logo, etc.)
        // We still use the menus table for configuration persistence
        const menuResult = await query(
            'SELECT * FROM menus WHERE user_id = $1 AND template_type = $2 LIMIT 1',
            [data.user_id, data.template_key]
        );
        const menuInstance = menuResult.rows[0] || { config: {} };

        // 3. Fetch Base Template items (respecting soft-delete)
        const baseItemsRes = await query(
            'SELECT * FROM template_items WHERE template_id = $1 AND is_deleted = false ORDER BY sort_order, id',
            [data.template_id]
        );
        const baseItems = baseItemsRes.rows;

        // 4. Fetch Restaurant Overrides for THIS activation
        const overridesRes = await query(
            'SELECT * FROM item_overrides WHERE restaurant_template_id = $1',
            [data.rt_id]
        );
        const overrides = overridesRes.rows;

        // 5. Merge with Fallback Logic (Field-level)
        const mergedItems = baseItems
            .map(baseItem => {
                const override = overrides.find(o => o.template_item_id === baseItem.id);
                if (override) {
                    // Respect the override's hidden status
                    if (override.is_hidden) return null;

                    return {
                        ...baseItem,
                        name: override.name_override ?? baseItem.name,
                        name_en: override.name_en ?? baseItem.name_en,
                        description: override.description_override ?? baseItem.description,
                        description_en: override.description_en ?? baseItem.description_en,
                        price: override.price_override ?? baseItem.price,
                        image_url: override.image_override ?? baseItem.image_url,
                        category: override.category_override ?? baseItem.category,
                        category_en: override.category_en ?? baseItem.category_en
                    };
                }


                // If no override exists, we return the base item but marked as HIDDEN.
                // This allows the frontend to know it exists (maybe for an "Edit" mode overlay?)
                // But specifically for Public Menu, we filter !is_hidden.
                // However, the previous code returned NULL, which meant it wasn't even there.
                // If we return it as hidden, it's still hidden in the UI, so no visual difference?
                // The user's issue "no item" might mean they expect to SEE them.
                // If I change this to `is_hidden: false`, they will see ALL items by default.
                // Given the confusion, perhaps for `testemplate3` (or generally), we should default to VISIBLE?
                // The user said "if he active the menu ... it will be empty".
                // So keeping it hidden is correct.

                return {
                    ...baseItem,
                    is_hidden: true // Default to hidden
                };
            })
            .filter(Boolean);

        // 5.5 Add Custom Items
        const customItems = overrides
            .filter(o => !o.template_item_id)
            .map(o => ({
                id: o.id,
                name: o.name_override,
                name_en: o.name_en,
                description: o.description_override,
                description_en: o.description_en,
                price: o.price_override,
                image_url: o.image_override,
                category: o.category_override || 'Special',
                category_en: o.category_en,
                is_custom: true
            }));

        const items = [...mergedItems, ...customItems].map(item => ({
            ...item,
            image: item.image_url // Unified for frontend
        }));

        // 6. Construct Final Response
        const finalConfig = {
            ...data.template_config,
            ...menuInstance.config,
            items: items,
            restaurantName: menuInstance.config?.restaurantName || data.restaurant_name
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                restaurant: data.restaurant_name,
                stripe_enabled: data.stripe_onboarding_complete,
                menu: {
                    id: menuInstance.id,
                    template_type: data.template_key,
                    config: finalConfig,
                    base_layout: data.base_layout
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

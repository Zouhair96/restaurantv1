import { query } from './db.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { restaurantName } = req.query;

        if (!restaurantName) {
            return res.status(400).json({ error: 'Restaurant name is required' });
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
            return res.status(404).json({ error: 'No active menu found for this restaurant' });
        }

        const data = result.rows[0];

        // 2. Fetch the "Menu" record for settings (Theme, Logo, etc.)
        const menuResult = await query(
            'SELECT * FROM menus WHERE user_id = $1 AND template_type = $2 LIMIT 1',
            [data.user_id, data.template_key]
        );
        const menuInstance = menuResult.rows[0] || { config: {} };

        // 3. Fetch Base Template items
        const baseItemsRes = await query(
            'SELECT * FROM template_items WHERE template_id = $1 AND is_deleted = false ORDER BY sort_order, id',
            [data.template_id]
        );
        const baseItems = baseItemsRes.rows;

        // 4. Fetch Restaurant Overrides
        const overridesRes = await query(
            'SELECT * FROM item_overrides WHERE restaurant_template_id = $1',
            [data.rt_id]
        );
        const overrides = overridesRes.rows;

        // 5. Merge with Fallback Logic
        const mergedItems = baseItems
            .map(baseItem => {
                const override = overrides.find(o => o.template_item_id === baseItem.id);
                if (override) {
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
                return { ...baseItem, is_hidden: true };
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
            image: item.image_url
        }));

        // 6. Construct Final Response
        const finalConfig = {
            ...data.template_config,
            ...menuInstance.config,
            items: items,
            restaurantName: menuInstance.config?.restaurantName || data.restaurant_name
        };

        return res.status(200).json({
            restaurant: data.restaurant_name,
            stripe_enabled: data.stripe_onboarding_complete,
            menu: {
                id: menuInstance.id,
                template_type: data.template_key,
                config: finalConfig,
                base_layout: data.base_layout
            }
        });

    } catch (error) {
        console.error('Public Menu API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

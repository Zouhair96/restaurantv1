import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    // Verify Token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const restaurantId = decoded.id;

        if (event.httpMethod === 'GET') {
            const { templateKey } = event.queryStringParameters || {};

            // 1. Get base template
            const templateRes = await query('SELECT * FROM templates WHERE template_key = $1 AND status = $2', [templateKey, 'active']);
            if (templateRes.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Template not found or inactive' }) };
            }
            const template = templateRes.rows[0];

            // 2. Fetch or initialize restaurant_template record (Tenancy boundary)
            const userRes = await query('SELECT role, subscription_plan, order_number_config FROM users WHERE id = $1', [restaurantId]);
            const user = userRes.rows[0];
            const plan = user.subscription_plan?.toLowerCase() || 'starter';

            let rtRes = await query('SELECT * FROM restaurant_templates WHERE restaurant_id = $1 AND template_id = $2', [restaurantId, template.id]);
            let rt = rtRes.rows[0];

            // Auto-activate if user has permission but record missing (Init logic)
            if (!rt && (user.role === 'admin' || template.allowed_plans.includes(plan))) {
                const insertRT = await query(
                    'INSERT INTO restaurant_templates (restaurant_id, template_id, subscription_tier, status) VALUES ($1, $2, $3, $4) RETURNING *',
                    [restaurantId, template.id, plan, 'active']
                );
                rt = insertRT.rows[0];
            }

            if (!rt || (rt.status !== 'active' && user.role !== 'admin')) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Template not activated or access denied' }) };
            }

            // 3. Subscription Gating (Re-verify tier)
            if (user.role !== 'admin' && !template.allowed_plans.includes(plan)) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Upgrade required to access this template tier' }) };
            }

            // 4. Fetch Base Items (respecting soft-delete)
            const itemsRes = await query('SELECT * FROM template_items WHERE template_id = $1 AND is_deleted = false ORDER BY sort_order, id', [template.id]);
            const baseItems = itemsRes.rows;

            // 5. Get overrides for THIS restaurant_template
            const overridesRes = await query(
                'SELECT * FROM item_overrides WHERE restaurant_template_id = $1',
                [rt.id]
            );
            const overrides = overridesRes.rows;

            // 6. Merge items with overrides (Field-level fallback logic)
            // CRITICAL CHANGE: For RESTAURANTS (active users), we hide base items by default unless they are explicitly overridden/unhidden.
            // For MASTER VIEW (templateKey present, implied by context or query), logic differs? 
            // Actually, we can use the source of the request. Admin/Public demo vs Restaurant.
            // But here we are authenticated as a restaurant user.
            // If the user hasn't overridden an item, we treat it as "Hidden" effectively creating a blank canvas.

            const mergedItems = baseItems.map(baseItem => {
                const override = overrides.find(o => o.template_item_id === baseItem.id);
                if (override) {
                    return {
                        ...baseItem,
                        name: override.name_override ?? baseItem.name,
                        name_en: override.name_en ?? baseItem.name_en,
                        description: override.description_override ?? baseItem.description,
                        description_en: override.description_en ?? baseItem.description_en,
                        price: override.price_override ?? baseItem.price,
                        image_url: override.image_override ?? baseItem.image_url,
                        image: override.image_override ?? baseItem.image_url,
                        category: override.category_override ?? baseItem.category,
                        category_en: override.category_en ?? baseItem.category_en,
                        is_hidden: override.is_hidden ?? false, // Respect override setting
                        has_override: true,
                        override_id: override.id
                    };
                }

                // If NO override, and we are a restaurant looking at our own menu...
                // User requirement: "if he active the menu ... it will be empty".
                // So default is_hidden = true for base items without overrides.
                return {
                    ...baseItem,
                    has_override: false,
                    is_hidden: true, // DEFAULT HIDDEN FOR RESTAURANTS 
                    image: baseItem.image_url
                };
            });

            // 5.1 Fetch Custom Items (Items with NO base template_item_id)
            const customItemsRes = await query(
                'SELECT * FROM item_overrides WHERE restaurant_template_id = $1 AND template_item_id IS NULL',
                [rt.id]
            );

            const customItems = customItemsRes.rows.map(item => ({
                id: item.id,
                name: item.name_override,
                name_en: item.name_en,
                description: item.description_override,
                description_en: item.description_en,
                price: item.price_override,
                image_url: item.image_override,
                // image: item.image_override,
                category: item.category_override,
                category_en: item.category_en,
                is_hidden: item.is_hidden,
                is_custom: true,
                restaurant_template_id: rt.id
            }));

            // Filter out hidden items if this is a "Public" fetch? 
            // The handler is used by ManageMenu (auth required) and potentially PublicMenu?
            // Actually PublicMenu uses `public-menu.js` or `templates.js` (for master).
            // This file `menu-overrides` is PROTECTED (requires Bearer token).
            // So this is primarily for the DASHBOARD / EDITOR.
            // In the EDITOR, we want to see them but maybe marked as "Hidden"?
            // Yes, user said "he will add his specific photos".
            // If we hide them here, the Editor will show them as "Hidden" (which is good).
            // But what about the Public View? Public View uses `public-menu` endpoint?

            const finalItems = [...mergedItems, ...customItems];

            // 5.5 Get Restaurant Menu Settings (Branding)
            const menuSettingsRes = await query('SELECT id, name, config FROM menus WHERE user_id = $1 AND template_type = $2 LIMIT 1', [restaurantId, templateKey]);
            const menuSettings = menuSettingsRes.rows[0];

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    template: {
                        ...template,
                        restaurant_template_id: rt.id,
                        restaurant_menu_id: menuSettings?.id,
                        restaurant_config: menuSettings?.config || {},
                        activation_status: rt.status,
                        subscription_tier: rt.subscription_tier,
                        order_number_config: user.order_number_config || {}
                    },
                    items: finalItems
                })
            };
        }

        if (event.httpMethod === 'POST') {
            const {
                id,
                template_item_id,
                name_override,
                name_en,
                description_override,
                description_en,
                price_override,
                image_override,
                category_override,
                category_en,
                is_hidden,
                restaurant_template_id
            } = JSON.parse(event.body);

            // Gating: Only active templates can have overrides updated
            const rtCheck = await query(`
                SELECT rt.status, t.allowed_plans 
                FROM restaurant_templates rt
                JOIN templates t ON rt.template_id = t.id
                WHERE rt.id = $1 AND rt.restaurant_id = $2
            `, [restaurant_template_id, restaurantId]);

            if (rtCheck.rows.length === 0 || (rtCheck.rows[0].status !== 'active')) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Cannot update overrides for inactive or unauthorized template' }) };
            }

            // Plan-specific check (Prevention of legacy customization after plan downgrade)
            const userRes = await query('SELECT role, subscription_plan, order_number_config FROM users WHERE id = $1', [restaurantId]);
            const dbUser = userRes.rows[0];
            const plan = dbUser.subscription_plan?.toLowerCase() || 'starter';
            const allowedPlans = rtCheck.rows[0].allowed_plans || [];

            if (dbUser.role !== 'admin' && !allowedPlans.includes(plan)) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Upgrade required: Your current plan does not support this template.' }) };
            }

            // Persistence Logic: 
            // 1. If template_item_id exists, it's an override (ON CONFLICT on template_item_id)
            // 2. If template_item_id is null, it's a "Custom Item" for this restaurant.

            let res;
            if (template_item_id) {
                // ... (Override logic stays same)
                res = await query(
                    `INSERT INTO item_overrides (restaurant_template_id, restaurant_id, template_item_id, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
                     ON CONFLICT (restaurant_id, template_item_id)
                     DO UPDATE SET 
                        name_override = EXCLUDED.name_override,
                        name_en = EXCLUDED.name_en,
                        description_override = EXCLUDED.description_override,
                        description_en = EXCLUDED.description_en,
                        price_override = EXCLUDED.price_override,
                        image_override = EXCLUDED.image_override,
                        category_override = EXCLUDED.category_override,
                        category_en = EXCLUDED.category_en,
                        is_hidden = EXCLUDED.is_hidden,
                        updated_at = NOW()
                     RETURNING *`,
                    [restaurant_template_id, restaurantId, template_item_id, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden]
                );
            } else if (id) {
                // Update existing custom item
                res = await query(
                    `UPDATE item_overrides SET
                        name_override = $1,
                        name_en = $2,
                        description_override = $3,
                        description_en = $4,
                        price_override = $5,
                        image_override = $6,
                        category_override = $7,
                        category_en = $8,
                        is_hidden = $9,
                        updated_at = NOW()
                     WHERE id = $10 AND restaurant_id = $11
                     RETURNING *`,
                    [name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden, id, restaurantId]
                );
            } else {
                // Purely custom item (no base item) - INSERT NEW
                res = await query(
                    `INSERT INTO item_overrides (restaurant_template_id, restaurant_id, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                     RETURNING *`,
                    [restaurant_template_id, restaurantId, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden || false]
                );
            }

            return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };
        }

    } catch (error) {
        console.error('Menu Overrides Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

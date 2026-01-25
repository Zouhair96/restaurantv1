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
            const userRes = await query('SELECT role, subscription_plan FROM users WHERE id = $1', [restaurantId]);
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
            const mergedItems = baseItems.map(baseItem => {
                const override = overrides.find(o => o.template_item_id === baseItem.id);
                if (override) {
                    return {
                        ...baseItem,
                        name: override.name_override ?? baseItem.name,
                        description: override.description_override ?? baseItem.description,
                        price: override.price_override ?? baseItem.price,
                        image_url: override.image_override ?? baseItem.image_url,
                        image: override.image_override ?? baseItem.image_url, // Unified for UI
                        category: override.category_override ?? baseItem.category,
                        is_hidden: override.is_hidden ?? false,
                        has_override: true,
                        override_id: override.id
                    };
                }
                return { ...baseItem, has_override: false, is_hidden: false, image: baseItem.image_url };
            });

            // 7. Add purely custom items (overrides with no base item)
            const customItems = overrides
                .filter(o => !o.template_item_id)
                .map(o => ({
                    id: o.id, // Using override ID as the primary ID for custom items
                    name: o.name_override,
                    description: o.description_override,
                    price: o.price_override,
                    image_url: o.image_override,
                    category: o.category_override || 'Special', // Need to make sure we save category too
                    is_hidden: o.is_hidden,
                    has_override: true,
                    is_custom: true
                }));

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
                        subscription_tier: rt.subscription_tier
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
                description_override,
                price_override,
                image_override,
                category_override,
                is_hidden,
                restaurant_template_id
            } = JSON.parse(event.body);

            // Gating: Only active templates can have overrides updated
            const rtCheck = await query('SELECT status FROM restaurant_templates WHERE id = $1 AND restaurant_id = $2', [restaurant_template_id, restaurantId]);
            if (rtCheck.rows.length === 0 || (rtCheck.rows[0].status !== 'active')) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Cannot update overrides for inactive or unauthorized template' }) };
            }

            // Persistence Logic: 
            // 1. If template_item_id exists, it's an override (ON CONFLICT on template_item_id)
            // 2. If template_item_id is null, it's a "Custom Item" for this restaurant.

            let res;
            if (template_item_id) {
                // ... (Override logic stays same)
                res = await query(
                    `INSERT INTO item_overrides (restaurant_template_id, restaurant_id, template_item_id, name_override, description_override, price_override, image_override, category_override, is_hidden, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                     ON CONFLICT (restaurant_id, template_item_id)
                     DO UPDATE SET 
                        name_override = EXCLUDED.name_override,
                        description_override = EXCLUDED.description_override,
                        price_override = EXCLUDED.price_override,
                        image_override = EXCLUDED.image_override,
                        category_override = EXCLUDED.category_override,
                        is_hidden = EXCLUDED.is_hidden,
                        updated_at = NOW()
                     RETURNING *`,
                    [restaurant_template_id, restaurantId, template_item_id, name_override, description_override, price_override, image_override, category_override, is_hidden]
                );
            } else if (id) {
                // Update existing custom item
                res = await query(
                    `UPDATE item_overrides SET
                        name_override = $1,
                        description_override = $2,
                        price_override = $3,
                        image_override = $4,
                        category_override = $5,
                        is_hidden = $6,
                        updated_at = NOW()
                     WHERE id = $7 AND restaurant_id = $8
                     RETURNING *`,
                    [name_override, description_override, price_override, image_override, category_override, is_hidden, id, restaurantId]
                );
            } else {
                // Purely custom item (no base item) - INSERT NEW
                res = await query(
                    `INSERT INTO item_overrides (restaurant_template_id, restaurant_id, name_override, description_override, price_override, image_override, category_override, is_hidden, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                     RETURNING *`,
                    [restaurant_template_id, restaurantId, name_override, description_override, price_override, image_override, category_override, is_hidden || false]
                );
            }

            return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };
        }

    } catch (error) {
        console.error('Menu Overrides Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

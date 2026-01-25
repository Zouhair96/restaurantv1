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
                        is_hidden: override.is_hidden ?? false,
                        has_override: true,
                        override_id: override.id
                    };
                }
                return { ...baseItem, has_override: false, is_hidden: false };
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    template: {
                        ...template,
                        restaurant_template_id: rt.id,
                        activation_status: rt.status,
                        subscription_tier: rt.subscription_tier
                    },
                    items: mergedItems
                })
            };
        }

        if (event.httpMethod === 'POST') {
            const { template_item_id, name_override, description_override, price_override, image_override, is_hidden, restaurant_template_id } = JSON.parse(event.body);

            // Verify user owns this restaurant_template or is admin
            let rtId = restaurant_template_id;
            if (!rtId) {
                // Try to find it if not provided
                const findRT = await query('SELECT id FROM restaurant_templates WHERE restaurant_id = $1 AND template_id = (SELECT template_id FROM template_items WHERE id = $2)', [restaurantId, template_item_id]);
                if (findRT.rows.length === 0) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Template record missing' }) };
                rtId = findRT.rows[0].id;
            }

            // Gating: Only active templates can have overrides updated
            const rtCheck = await query('SELECT status FROM restaurant_templates WHERE id = $1 AND restaurant_id = $2', [rtId, restaurantId]);
            if (rtCheck.rows.length === 0 || (rtCheck.rows[0].status !== 'active')) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Cannot update overrides for inactive template' }) };
            }

            const res = await query(
                `INSERT INTO item_overrides (restaurant_template_id, restaurant_id, template_item_id, name_override, description_override, price_override, image_override, is_hidden, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                 ON CONFLICT (restaurant_id, template_item_id)
                 DO UPDATE SET 
                    name_override = EXCLUDED.name_override,
                    description_override = EXCLUDED.description_override,
                    price_override = EXCLUDED.price_override,
                    image_override = EXCLUDED.image_override,
                    is_hidden = EXCLUDED.is_hidden,
                    restaurant_template_id = EXCLUDED.restaurant_template_id,
                    updated_at = NOW()
                 RETURNING *`,
                [rtId, restaurantId, template_item_id, name_override, description_override, price_override, image_override, is_hidden]
            );

            return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };
        }

    } catch (error) {
        console.error('Menu Overrides Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

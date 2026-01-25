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

            // Get base template and its items
            const templateRes = await query('SELECT * FROM templates WHERE template_key = $1', [templateKey]);
            if (templateRes.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Template not found' }) };
            }
            const template = templateRes.rows[0];

            // Check subscription plan access
            const userRes = await query('SELECT role, subscription_plan FROM users WHERE id = $1', [restaurantId]);
            const user = userRes.rows[0];
            const plan = user.subscription_plan?.toLowerCase() || 'starter';

            if (user.role !== 'admin' && !template.allowed_plans.includes(plan)) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Upgrade required to access this template' }) };
            }

            const itemsRes = await query('SELECT * FROM template_items WHERE template_id = $1 ORDER BY sort_order, id', [template.id]);
            const baseItems = itemsRes.rows;

            // Get overrides for this restaurant
            const overridesRes = await query(
                'SELECT * FROM item_overrides WHERE restaurant_id = $1 AND template_item_id IN (SELECT id FROM template_items WHERE template_id = $2)',
                [restaurantId, template.id]
            );
            const overrides = overridesRes.rows;

            // Fetch or Initialize the restaurant's menu record
            let userMenuRes = await query('SELECT * FROM menus WHERE user_id = $1 AND template_type = $2 LIMIT 1', [restaurantId, templateKey]);
            let userMenu = userMenuRes.rows[0];

            if (!userMenu) {
                const insertRes = await query(
                    'INSERT INTO menus (user_id, name, template_type, config) VALUES ($1, $2, $3, $4) RETURNING *',
                    [restaurantId, `${template.name} Menu`, templateKey, template.config || {}]
                );
                userMenu = insertRes.rows[0];
            }

            // Merge items with overrides (Fallback Logic)
            const mergedItems = baseItems.map(baseItem => {
                const override = overrides.find(o => o.template_item_id === baseItem.id);
                if (override) {
                    return {
                        ...baseItem,
                        name: override.name_override || baseItem.name,
                        description: override.description_override || baseItem.description,
                        price: override.price_override || baseItem.price,
                        image_url: override.image_override || baseItem.image_url,
                        is_hidden: override.is_hidden,
                        has_override: true,
                        override_id: override.id
                    };
                }
                return { ...baseItem, has_override: false };
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    template: {
                        ...template,
                        restaurant_menu_id: userMenu.id,
                        restaurant_config: userMenu.config
                    },
                    items: mergedItems
                })
            };
        }

        if (event.httpMethod === 'POST') {
            const { template_item_id, name_override, description_override, price_override, image_override, is_hidden } = JSON.parse(event.body);

            const res = await query(
                `INSERT INTO item_overrides (restaurant_id, template_item_id, name_override, description_override, price_override, image_override, is_hidden, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                 ON CONFLICT (restaurant_id, template_item_id)
                 DO UPDATE SET 
                    name_override = EXCLUDED.name_override,
                    description_override = EXCLUDED.description_override,
                    price_override = EXCLUDED.price_override,
                    image_override = EXCLUDED.image_override,
                    is_hidden = EXCLUDED.is_hidden,
                    updated_at = NOW()
                 RETURNING *`,
                [restaurantId, template_item_id, name_override, description_override, price_override, image_override, is_hidden]
            );

            return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };
        }

    } catch (error) {
        console.error('Menu Overrides Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server configuration error' });

    try {
        const decoded = jwt.verify(token, secret);
        const restaurantId = decoded.id;

        if (req.method === 'GET') {
            const { templateKey } = req.query;

            const templateRes = await query('SELECT * FROM templates WHERE template_key = $1 AND status = $2', [templateKey, 'active']);
            if (templateRes.rows.length === 0) return res.status(404).json({ error: 'Template not found' });
            const template = templateRes.rows[0];

            const userRes = await query('SELECT role, subscription_plan, order_number_config FROM users WHERE id = $1', [restaurantId]);
            const user = userRes.rows[0];
            const plan = user.subscription_plan?.toLowerCase() || 'starter';

            let rtRes = await query('SELECT * FROM restaurant_templates WHERE restaurant_id = $1 AND template_id = $2', [restaurantId, template.id]);
            let rt = rtRes.rows[0];

            if (!rt && (user.role === 'admin' || template.allowed_plans.includes(plan))) {
                const insertRT = await query(
                    'INSERT INTO restaurant_templates (restaurant_id, template_id, subscription_tier, status) VALUES ($1, $2, $3, $4) RETURNING *',
                    [restaurantId, template.id, plan, 'active']
                );
                rt = insertRT.rows[0];
            }

            if (!rt || (rt.status !== 'active' && user.role !== 'admin')) return res.status(403).json({ error: 'Template not activated' });

            const itemsRes = await query('SELECT * FROM template_items WHERE template_id = $1 AND is_deleted = false ORDER BY sort_order, id', [template.id]);
            const overridesRes = await query('SELECT * FROM item_overrides WHERE restaurant_template_id = $1', [rt.id]);
            const overrides = overridesRes.rows;

            const mergedItems = itemsRes.rows.map(baseItem => {
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
                        is_hidden: override.is_hidden ?? false,
                        has_override: true,
                        override_id: override.id
                    };
                }
                return { ...baseItem, has_override: false, is_hidden: true, image: baseItem.image_url };
            });

            const customItemsRes = await query('SELECT * FROM item_overrides WHERE restaurant_template_id = $1 AND template_item_id IS NULL', [rt.id]);
            const customItems = customItemsRes.rows.map(item => ({
                id: item.id,
                name: item.name_override,
                name_en: item.name_en,
                description: item.description_override,
                description_en: item.description_en,
                price: item.price_override,
                image_url: item.image_override,
                category: item.category_override,
                category_en: item.category_en,
                is_hidden: item.is_hidden,
                is_custom: true,
                restaurant_template_id: rt.id
            }));

            const menuSettingsRes = await query('SELECT id, config FROM menus WHERE user_id = $1 AND template_type = $2 LIMIT 1', [restaurantId, templateKey]);
            const menuSettings = menuSettingsRes.rows[0];

            return res.status(200).json({
                template: {
                    ...template,
                    restaurant_template_id: rt.id,
                    restaurant_menu_id: menuSettings?.id,
                    restaurant_config: menuSettings?.config || {},
                    activation_status: rt.status,
                    subscription_tier: rt.subscription_tier,
                    order_number_config: user.order_number_config || {}
                },
                items: [...mergedItems, ...customItems]
            });
        }

        if (req.method === 'POST') {
            const { id, template_item_id, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden, restaurant_template_id } = req.body;

            const rtCheck = await query('SELECT rt.status, t.allowed_plans FROM restaurant_templates rt JOIN templates t ON rt.template_id = t.id WHERE rt.id = $1 AND rt.restaurant_id = $2', [restaurant_template_id, restaurantId]);
            if (rtCheck.rows.length === 0 || rtCheck.rows[0].status !== 'active') return res.status(403).json({ error: 'Unauthorized template update' });

            const userRes = await query('SELECT role, subscription_plan FROM users WHERE id = $1', [restaurantId]);
            const plan = userRes.rows[0].subscription_plan?.toLowerCase() || 'starter';
            if (userRes.rows[0].role !== 'admin' && !rtCheck.rows[0].allowed_plans.includes(plan)) return res.status(403).json({ error: 'Upgrade required' });

            let result;
            if (template_item_id) {
                result = await query(
                    `INSERT INTO item_overrides (restaurant_template_id, restaurant_id, template_item_id, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
                     ON CONFLICT (restaurant_id, template_item_id)
                     DO UPDATE SET name_override=EXCLUDED.name_override, name_en=EXCLUDED.name_en, description_override=EXCLUDED.description_override, description_en=EXCLUDED.description_en, price_override=EXCLUDED.price_override, image_override=EXCLUDED.image_override, category_override=EXCLUDED.category_override, category_en=EXCLUDED.category_en, is_hidden=EXCLUDED.is_hidden, updated_at=NOW() RETURNING *`,
                    [restaurant_template_id, restaurantId, template_item_id, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden]
                );
            } else if (id) {
                result = await query(`UPDATE item_overrides SET name_override=$1, name_en=$2, description_override=$3, description_en=$4, price_override=$5, image_override=$6, category_override=$7, category_en=$8, is_hidden=$9, updated_at=NOW() WHERE id=$10 AND restaurant_id=$11 RETURNING *`, [name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden, id, restaurantId]);
            } else {
                result = await query(`INSERT INTO item_overrides (restaurant_template_id, restaurant_id, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`, [restaurant_template_id, restaurantId, name_override, name_en, description_override, description_en, price_override, image_override, category_override, category_en, is_hidden || false]);
            }
            return res.status(200).json(result.rows[0]);
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Menu Overrides Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

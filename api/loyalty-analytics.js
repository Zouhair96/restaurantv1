import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server configuration error' });

    try {
        // --- Schema Maintenance ---
        try {
            await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_config JSONB DEFAULT '{"isAutoPromoOn": true, "recoveryConfig": {"type": "discount", "value": "20", "active": true, "delay": "21", "frequency": "30"}}'`);
            await query(`
                CREATE TABLE IF NOT EXISTS visitor_events (
                    id SERIAL PRIMARY KEY,
                    restaurant_id INT REFERENCES users(id),
                    visitor_uuid TEXT,
                    event_type TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } catch (dbErr) {
            console.warn('[DB Warning]: Could not ensure schema:', dbErr.message);
        }

        // --- POST: Record Visitor Event ---
        if (req.method === 'POST') {
            const { restaurantName, visitorUuid, eventType, configUpdate } = req.body;

            if (configUpdate) {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({ error: 'Unauthorized: Missing token' });
                }

                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, secret);
                const restaurantId = decoded.id;

                const updateRes = await query(
                    'UPDATE users SET loyalty_config = COALESCE(loyalty_config, \'{}\'::jsonb) || $1::jsonb WHERE id = $2 RETURNING loyalty_config',
                    [JSON.stringify(configUpdate), restaurantId]
                );

                return res.status(200).json({ success: true, loyalty_config: updateRes.rows[0]?.loyalty_config });
            }

            if (!restaurantName || !visitorUuid || !eventType) {
                return res.status(400).json({ error: 'Missing sync data' });
            }

            const resResult = await query('SELECT id FROM users WHERE restaurant_name = $1 LIMIT 1', [restaurantName]);
            if (resResult.rows.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
            const restaurantId = resResult.rows[0].id;

            await query(
                'INSERT INTO visitor_events (restaurant_id, visitor_uuid, event_type, created_at) VALUES ($1, $2, $3, NOW())',
                [restaurantId, visitorUuid, eventType]
            );

            const configRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
            return res.status(201).json({ success: true, loyalty_config: configRes.rows[0]?.loyalty_config || {} });
        }

        // --- GET: Fetch Aggregated Stats & Config ---
        if (req.method === 'GET') {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized: Missing token' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, secret);
            const restaurantId = decoded.id;

            const configResult = await query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
            if (configResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
            const loyalty_config = configResult.rows[0].loyalty_config;

            const statsQuery = `
                SELECT 
                    (SELECT COUNT(DISTINCT visitor_uuid) FROM visitor_events WHERE restaurant_id = $1 AND event_type = 'loyal_status_reached') as loyal_count,
                    (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND loyalty_discount_applied = true) as offers_applied,
                    (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND loyalty_discount_applied = true) as loyalty_revenue
            `;
            const statsResult = await query(statsQuery, [restaurantId]);
            const stats = statsResult.rows[0] || { loyal_count: 0, offers_applied: 0, loyalty_revenue: 0 };

            const menuItemsQuery = `
                SELECT DISTINCT ON (name)
                    COALESCE(io.name_override, ti.name) as name,
                    COALESCE(io.price_override, ti.price) as price
                FROM restaurant_templates rt
                JOIN templates t ON rt.template_id = t.id
                LEFT JOIN template_items ti ON ti.template_id = t.id AND ti.is_deleted = false
                LEFT JOIN item_overrides io ON io.template_item_id = ti.id AND io.restaurant_id = rt.restaurant_id
                WHERE rt.restaurant_id = $1 AND rt.status = 'active'
                UNION
                SELECT name_override as name, price_override as price
                FROM item_overrides
                WHERE restaurant_id = $1 AND template_item_id IS NULL
            `;
            const menuItemsResult = await query(menuItemsQuery, [restaurantId]);

            return res.status(200).json({
                loyal_clients: parseInt(stats.loyal_count || 0),
                offers_applied: parseInt(stats.offers_applied || 0),
                loyalty_revenue: parseFloat(stats.loyalty_revenue || 0).toFixed(2),
                loyalty_config,
                menu_items: menuItemsResult.rows.map(item => ({ name: item.name, price: parseFloat(item.price || 0) }))
            });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Loyalty Analytics Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        // --- Middleware: Ensure Schema is ready (Simple one-time check) ---
        // In a real serverless env, we'd do this via migrations, but for persistence fix:
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_config JSONB DEFAULT '{"isAutoPromoOn": true, "recoveryConfig": {"type": "discount", "value": "20", "active": true, "delay": "21", "frequency": "30"}}'`);

        // --- POST: Record Visitor Event ---
        if (event.httpMethod === 'POST') {
            const { restaurantName, visitorUuid, eventType, configUpdate } = JSON.parse(event.body);

            // If it's a settings update from the dashboard
            if (configUpdate) {
                const authHeader = event.headers.authorization || event.headers.Authorization;
                if (!authHeader) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                const restaurantId = decoded.id;

                const updateRes = await query(
                    'UPDATE users SET loyalty_config = loyalty_config || $1::jsonb WHERE id = $2 RETURNING loyalty_config',
                    [JSON.stringify(configUpdate), restaurantId]
                );
                return { statusCode: 200, headers, body: JSON.stringify({ success: true, loyalty_config: updateRes.rows[0].loyalty_config }) };
            }

            if (!restaurantName || !visitorUuid || !eventType) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing sync data' }) };
            }

            // ... (rest of standard POST event logic) ...
            const resResult = await query('SELECT id FROM users WHERE restaurant_name = $1 LIMIT 1', [restaurantName]);
            if (resResult.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Restaurant not found' }) };
            }
            const restaurantId = resResult.rows[0].id;

            if (eventType === 'visit') {
                await query(`
                    INSERT INTO visitor_events (restaurant_id, visitor_uuid, event_type, created_at)
                    SELECT $1, $2, $3, NOW()
                    WHERE NOT EXISTS (
                        SELECT 1 FROM visitor_events 
                        WHERE restaurant_id = $1 AND visitor_uuid = $2 AND event_type = $3 
                        AND created_at > NOW() - INTERVAL '1 hour'
                    )
                `, [restaurantId, visitorUuid, eventType]);
            } else {
                await query(
                    'INSERT INTO visitor_events (restaurant_id, visitor_uuid, event_type, created_at) VALUES ($1, $2, $3, NOW())',
                    [restaurantId, visitorUuid, eventType]
                );
            }

            return { statusCode: 201, headers, body: JSON.stringify({ success: true }) };
        }

        // --- GET: Fetch Aggregated Stats & Config (Owner Only) ---
        if (event.httpMethod === 'GET') {
            const authHeader = event.headers.authorization || event.headers.Authorization;
            if (!authHeader) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const restaurantId = decoded.id;

            // Aggregation Query
            const statsQuery = `
                WITH LoyaltyStats AS (
                    SELECT COUNT(DISTINCT visitor_uuid) as loyal_count
                    FROM visitor_events
                    WHERE restaurant_id = $1 AND event_type = 'loyal_status_reached'
                ),
                OrderStats AS (
                    SELECT 
                        COUNT(*) as offers_applied,
                        SUM(total_price) as loyalty_revenue
                    FROM orders
                    WHERE restaurant_id = $1 
                    AND status != 'cancelled'
                    AND loyalty_discount_applied = true
                ),
                RestaurantConfig AS (
                    SELECT loyalty_config FROM users WHERE id = $1
                )
                SELECT 
                    l.loyal_count,
                    o.offers_applied,
                    COALESCE(o.loyalty_revenue, 0) as loyalty_revenue,
                    c.loyalty_config
                FROM LoyaltyStats l, OrderStats o, RestaurantConfig c;
            `;

            const result = await query(statsQuery, [restaurantId]);
            const stats = result.rows[0];

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    loyal_clients: parseInt(stats.loyal_count || 0),
                    offers_applied: parseInt(stats.offers_applied || 0),
                    loyalty_revenue: parseFloat(stats.loyalty_revenue || 0).toFixed(2),
                    loyalty_config: stats.loyalty_config
                })
            };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    } catch (error) {
        console.error('[Loyalty Analytics Error]:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process analytics', details: error.message })
        };
    }
};

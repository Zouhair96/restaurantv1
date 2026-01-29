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
        try {
            await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_config JSONB DEFAULT '{"isAutoPromoOn": true, "recoveryConfig": {"type": "discount", "value": "20", "active": true, "delay": "21", "frequency": "30"}}'`);
        } catch (dbErr) {
            console.warn('[DB Warning]: Could not alter table (column might exist or permissions issue):', dbErr.message);
        }

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

                console.log(`[Loyalty] Updating config for restaurant ${restaurantId}:`, configUpdate);

                const updateRes = await query(
                    'UPDATE users SET loyalty_config = COALESCE(loyalty_config, \'{}\'::jsonb) || $1::jsonb WHERE id = $2 RETURNING loyalty_config',
                    [JSON.stringify(configUpdate), restaurantId]
                );

                if (updateRes.rows.length === 0) {
                    console.error(`[Loyalty] Failed to update: User ${restaurantId} not found`);
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Restaurant not found' }) };
                }

                console.log(`[Loyalty] Update successful for ${restaurantId}`);
                return { statusCode: 200, headers, body: JSON.stringify({ success: true, loyalty_config: updateRes.rows[0].loyalty_config }) };
            }
            // ... (rest of standard POST event logic) ...
            // ...
        }

        // --- GET: Fetch Aggregated Stats & Config (Owner Only) ---
        if (event.httpMethod === 'GET') {
            const authHeader = event.headers.authorization || event.headers.Authorization;
            if (!authHeader) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const restaurantId = decoded.id;

            console.log(`[Loyalty] Fetching stats for restaurant ${restaurantId}`);

            // Fetch Config First (Most critical for this fix)
            const configResult = await query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
            if (configResult.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
            }
            const loyalty_config = configResult.rows[0].loyalty_config;

            // Aggregation Query for Stats
            const statsQuery = `
                SELECT 
                    (SELECT COUNT(DISTINCT visitor_uuid) FROM visitor_events WHERE restaurant_id = $1 AND event_type = 'loyal_status_reached') as loyal_count,
                    (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND loyalty_discount_applied = true) as offers_applied,
                    (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND loyalty_discount_applied = true) as loyalty_revenue
            `;

            const statsResult = await query(statsQuery, [restaurantId]);
            const stats = statsResult.rows[0];

            console.log(`[Loyalty] Fetch success for ${restaurantId}. Config found:`, !!loyalty_config);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    loyal_clients: parseInt(stats.loyal_count || 0),
                    offers_applied: parseInt(stats.offers_applied || 0),
                    loyalty_revenue: parseFloat(stats.loyalty_revenue || 0).toFixed(2),
                    loyalty_config: loyalty_config
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

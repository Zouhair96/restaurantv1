import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

export const handler = async (event, context) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("CRITICAL: JWT_SECRET is missing from environment");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        // --- Middleware: Ensure Schema is ready ---
        try {
            await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_config JSONB DEFAULT '{"isAutoPromoOn": true, "recoveryConfig": {"type": "discount", "value": "20", "active": true, "delay": "21", "frequency": "30"}}'`);

            // Create visitor_events table if missing
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
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const { restaurantName, visitorUuid, eventType, configUpdate } = body;

            if (configUpdate) {
                const authHeader = event.headers.authorization || event.headers.Authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Missing token' }) };
                }

                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, secret);
                const restaurantId = decoded.id;

                const updateRes = await query(
                    'UPDATE users SET loyalty_config = COALESCE(loyalty_config, \'{}\'::jsonb) || $1::jsonb WHERE id = $2 RETURNING loyalty_config',
                    [JSON.stringify(configUpdate), restaurantId]
                );

                if (updateRes.rows.length === 0) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Restaurant not found' }) };
                }

                return { statusCode: 200, headers, body: JSON.stringify({ success: true, loyalty_config: updateRes.rows[0].loyalty_config }) };
            }

            if (!restaurantName || !visitorUuid || !eventType) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing sync data' }) };
            }

            const resResult = await query('SELECT id FROM users WHERE restaurant_name = $1 LIMIT 1', [restaurantName]);
            if (resResult.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Restaurant not found' }) };
            }
            const restaurantId = resResult.rows[0].id;

            await query(
                'INSERT INTO visitor_events (restaurant_id, visitor_uuid, event_type, created_at) VALUES ($1, $2, $3, NOW())',
                [restaurantId, visitorUuid, eventType]
            );

            // Fetch the current config to return to the client
            const configRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
            const loyalty_config = configRes.rows[0]?.loyalty_config || {};

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    loyalty_config
                })
            };
        }

        // --- GET: Fetch Aggregated Stats & Config ---
        if (event.httpMethod === 'GET') {
            const authHeader = event.headers.authorization || event.headers.Authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Missing token' }) };
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, secret);
            const restaurantId = decoded.id;

            const configResult = await query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
            if (configResult.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
            }
            const loyalty_config = configResult.rows[0].loyalty_config;

            let stats = { loyal_count: 0, offers_applied: 0, loyalty_revenue: 0 };
            try {
                const statsQuery = `
                    SELECT 
                        (SELECT COUNT(DISTINCT visitor_uuid) FROM visitor_events WHERE restaurant_id = $1 AND event_type = 'loyal_status_reached') as loyal_count,
                        (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND loyalty_discount_applied = true) as offers_applied,
                        (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND loyalty_discount_applied = true) as loyalty_revenue
                `;
                const statsResult = await query(statsQuery, [restaurantId]);
                stats = statsResult.rows[0] || stats;
            } catch (statsErr) {
                console.warn('[Loyalty] Stats fetch failed:', statsErr.message);
            }

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

        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    error: 'Unauthorized',
                    details: error.message,
                    code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error',
                details: error.message
            })
        };
    }
};

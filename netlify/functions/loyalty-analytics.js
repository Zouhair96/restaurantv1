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
        // --- POST: Record Visitor Event ---
        if (event.httpMethod === 'POST') {
            const { restaurantName, visitorUuid, eventType } = JSON.parse(event.body);

            if (!restaurantName || !visitorUuid || !eventType) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing sync data' }) };
            }

            // Find restaurant ID
            const resResult = await query('SELECT id FROM users WHERE restaurant_name = $1 LIMIT 1', [restaurantName]);
            if (resResult.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Restaurant not found' }) };
            }
            const restaurantId = resResult.rows[0].id;

            // Record Event (Visitor events are anonymous but linked to a restaurant)
            // Note: We ignore duplicates for 'visit' in the same hour to keep data clean
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

        // --- GET: Fetch Aggregated Stats (Owner Only) ---
        if (event.httpMethod === 'GET') {
            const authHeader = event.headers.authorization || event.headers.Authorization;
            if (!authHeader) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const restaurantId = decoded.id;

            // Aggregation Query
            const statsQuery = `
                WITH LoyaltyStats AS (
                    -- Count unique visitors who reached 'LOYAL' status
                    SELECT COUNT(DISTINCT visitor_uuid) as loyal_count
                    FROM visitor_events
                    WHERE restaurant_id = $1 AND event_type = 'loyal_status_reached'
                ),
                OrderStats AS (
                    -- Sum orders with loyalty discounts
                    SELECT 
                        COUNT(*) as offers_applied,
                        SUM(total_price) as loyalty_revenue
                    FROM orders
                    WHERE restaurant_id = $1 
                    AND status != 'cancelled'
                    AND loyalty_discount_applied = true
                )
                SELECT 
                    l.loyal_count,
                    o.offers_applied,
                    COALESCE(o.loyalty_revenue, 0) as loyalty_revenue
                FROM LoyaltyStats l, OrderStats o;
            `;

            const result = await query(statsQuery, [restaurantId]);
            const stats = result.rows[0];

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    loyal_clients: parseInt(stats.loyal_count || 0),
                    offers_applied: parseInt(stats.offers_applied || 0),
                    loyalty_revenue: parseFloat(stats.loyalty_revenue || 0).toFixed(2)
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

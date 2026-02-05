import { query } from './db.js';

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { loyaltyId, restaurantId, restaurantName } = event.queryStringParameters;

        if (!loyaltyId || (!restaurantId && !restaurantName)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing loyaltyId or restaurant identifier' })
            };
        }

        let targetRestaurantId = restaurantId;

        // Resolve Restaurant ID from Name if needed
        if (!targetRestaurantId && restaurantName) {
            const userRes = await query('SELECT id FROM users WHERE restaurant_name = $1', [restaurantName]);
            if (userRes.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Restaurant not found' }) };
            }
            targetRestaurantId = userRes.rows[0].id;
        }

        // Query strict Completed orders with Timestamps
        const result = await query(`
            SELECT 
                total_price,
                created_at
            FROM orders
            WHERE restaurant_id = $1 
            AND loyalty_id = $2
            AND status = 'completed'
            ORDER BY created_at ASC
        `, [targetRestaurantId, loyaltyId]);

        const orders = result.rows;
        let totalSpending = 0;
        orders.forEach(o => {
            totalSpending += parseFloat(o.total_price) || 0;
        });

        // --- STRICT POINTS & SESSION SYSTEM ---
        const IS_DEV = process.env.URL?.includes('localhost') || !process.env.URL;
        const SESSION_TIMEOUT = IS_DEV ? 5 * 60 * 1000 : 4 * 60 * 60 * 1000;
        const now = new Date();

        // 1. Get Visitor State
        let visitorRes = await query(`
            SELECT * FROM loyalty_visitors 
            WHERE restaurant_id = $1 AND device_id = $2
        `, [targetRestaurantId, loyaltyId]);

        let visitor = visitorRes.rows[0];
        if (!visitor) {
            const insertRes = await query(`
                INSERT INTO loyalty_visitors (restaurant_id, device_id, visit_count, last_session_at, current_step, orders_in_current_session, total_points)
                VALUES ($1, $2, 0, NOW(), 'NEW', 0, 0)
                RETURNING *
            `, [targetRestaurantId, loyaltyId]);
            visitor = insertRes.rows[0];
        }

        // 2. Fetch Points & Gifts (Source of Truth)
        const pointsRes = await query('SELECT COALESCE(SUM(amount), 0) as total FROM points_transactions WHERE device_id = $1 AND restaurant_id = $2', [loyaltyId, targetRestaurantId]);
        const totalPoints = parseInt(pointsRes.rows[0].total);

        const giftsRes = await query('SELECT * FROM gifts WHERE device_id = $1 AND restaurant_id = $2 AND status = \'unused\'', [loyaltyId, targetRestaurantId]);
        const activeGifts = giftsRes.rows;

        // 3. Determine if current session is valid (Authoritative Rule)
        const ordersInCurrentSession = parseInt(visitor.orders_in_current_session || 0);
        const sessionIsValid = ordersInCurrentSession > 0;

        // Sync local cache if different (Integrity Check)
        if (parseInt(visitor.total_points) !== totalPoints) {
            await query('UPDATE loyalty_visitors SET total_points = $1 WHERE id = $2', [totalPoints, visitor.id]);
        }

        const visitCount = parseInt(visitor.visit_count || 0);

        // 4. Return Authorized State
        const configRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [targetRestaurantId]);
        const loyaltyConfig = configRes.rows[0]?.loyalty_config || { isAutoPromoOn: true };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                totalPoints: totalPoints,
                totalVisits: visitCount,
                ordersInCurrentVisit: ordersInCurrentSession,
                sessionIsValid: sessionIsValid,
                activeGifts: activeGifts,
                loyalty_config: loyaltyConfig,
                session_timeout_ms: SESSION_TIMEOUT
            })
        };

    } catch (error) {
        console.error('Get Loyalty Status Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

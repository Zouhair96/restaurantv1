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

        // --- STRICT EXPLOIT-SAFE SESSION FINALIZATION ---
        const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 Minutes (Temp for testing)
        const now = new Date();

        // 1. Get Visitor State
        let visitorRes = await query(`
            SELECT * FROM loyalty_visitors 
            WHERE restaurant_id = $1 AND device_id = $2
        `, [targetRestaurantId, loyaltyId]);

        let visitor = visitorRes.rows[0];
        if (!visitor) {
            const insertRes = await query(`
                INSERT INTO loyalty_visitors (restaurant_id, device_id, visit_count, last_session_at, current_step, orders_in_current_session)
                VALUES ($1, $2, 0, NOW(), 'NEW', 0)
                RETURNING *
            `, [targetRestaurantId, loyaltyId]);
            visitor = insertRes.rows[0];
        }

        // 2. Detect New Session Window
        const lastSessionTime = visitor.last_session_at ? new Date(visitor.last_session_at).getTime() : 0;
        const lastCountedTime = visitor.last_counted_at ? new Date(visitor.last_counted_at).getTime() : 0;
        const timeSinceLastSession = now.getTime() - lastSessionTime;
        const isNewWindow = timeSinceLastSession > SESSION_TIMEOUT;

        // Sync all markers
        const updateRes = await query(`
                UPDATE loyalty_visitors 
                SET 
                    visit_count = $1,
                    last_session_at = NOW(),
                    last_counted_at = CASE WHEN $2 = TRUE THEN NOW() ELSE last_counted_at END,
                    orders_in_current_session = 0
                WHERE id = $3
                RETURNING *
            `, [visitCount, ordersCheck?.rows?.length > 0 || false, visitor.id]);
        visitor = updateRes.rows[0];
    } else {
        // ACTIVE SESSION: Update last_session_at with a "User Heartbeat"
        // This ensures that as long as the user is ACTIVELY looking at the menu, 
        // the session stays open. The 4h timer starts when they CLOSE the menu.
        await query('UPDATE loyalty_visitors SET last_session_at = NOW() WHERE id = $1', [visitor.id]);
    }

    const visitCount = visitor.visit_count;
    const ordersInCurrentSession = visitor.orders_in_current_session;

    // Return Authoritative Server State
    // Add loyalty_config so public menu knows what rewards to show
    const configRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [targetRestaurantId]);
    const loyaltyConfig = configRes.rows[0]?.loyalty_config || { isAutoPromoOn: true };

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            completedOrders: orders.length, // Legacy/Display
            totalSpending: totalSpending,   // Legacy/Display
            totalVisits: visitCount,        // FROM DB (Authoritative)
            ordersInCurrentVisit: ordersInCurrentSession, // FROM DB (Authoritative)
            loyalty_config: loyaltyConfig
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

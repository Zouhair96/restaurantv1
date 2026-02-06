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

        // 1. Fetch Points & Visitor State (Source of Truth)
        const visitorRes = await query(`
            SELECT 
                id,
                total_points, 
                visit_count, 
                orders_in_current_session,
                last_visit_at,
                visit_count as totalVisits
            FROM loyalty_visitors 
            WHERE restaurant_id = $1 AND device_id = $2
        `, [targetRestaurantId, loyaltyId]);

        let visitor = visitorRes.rows[0] || { total_points: 0, visit_count: 0, orders_in_current_session: 0 };
        let totalPoints = parseInt(visitor.total_points || 0);
        let visitCount = parseInt(visitor.visit_count || 0);
        let ordersInCurrentSession = parseInt(visitor.orders_in_current_session || 0);

        // 1.5. SESSION RESET LOGIC
        // If last visit was more than 30 minutes ago, reset session orders
        const lastVisit = visitor.last_visit_at ? new Date(visitor.last_visit_at) : new Date(0);
        const now = new Date();
        const sessionTimeout = 30 * 60 * 1000; // 30 mins

        if (now - lastVisit > sessionTimeout && ordersInCurrentSession > 0) {
            await query('UPDATE loyalty_visitors SET orders_in_current_session = 0 WHERE id = $1', [visitor.id]);
            ordersInCurrentSession = 0;
        }

        // 2. Fetch Active Gifts (Source of Truth)
        const giftsRes = await query(`
            SELECT id, euro_value, type, percentage_value, status, created_at 
            FROM gifts 
            WHERE device_id = $1 AND restaurant_id = $2 AND status = 'unused'
        `, [loyaltyId, targetRestaurantId]);
        const activeGifts = giftsRes.rows;

        // 3. Fetch Restaurant Config
        const configRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [targetRestaurantId]);
        const loyaltyConfig = configRes.rows[0]?.loyalty_config || { isAutoPromoOn: true };

        // 4. Calculate total spending from completed orders for UI stats
        const spendingRes = await query(`
            SELECT SUM(total_price) as total 
            FROM orders 
            WHERE restaurant_id = $1 AND loyalty_id = $2 AND status = 'completed'
        `, [targetRestaurantId, loyaltyId]);
        const totalSpending = parseFloat(spendingRes.rows[0]?.total || 0);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                totalPoints: totalPoints,
                totalVisits: visitCount,
                ordersInCurrentVisit: ordersInCurrentSession,
                sessionIsValid: ordersInCurrentSession > 0,
                activeGifts: activeGifts,
                loyalty_config: loyaltyConfig,
                totalSpending: totalSpending,

                // --- UI Helpers (Based strictly on state above) ---
                hasPlacedOrderInCurrentSession: ordersInCurrentSession > 0,
                isWelcomeDiscountEligible: visitCount === 1 && ordersInCurrentSession === 0,
                isLoyalDiscountActive: visitCount >= 3
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

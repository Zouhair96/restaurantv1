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
                last_visit_at
            FROM loyalty_visitors 
            WHERE restaurant_id = $1 AND device_id = $2
        `, [targetRestaurantId, loyaltyId]);

        let visitor = visitorRes.rows[0] || { total_points: 0, visit_count: 0, orders_in_current_session: 0 };
        let totalPoints = parseInt(visitor.total_points || 0);
        let visitCount = parseInt(visitor.visit_count || 0);
        let ordersInCurrentSession = parseInt(visitor.orders_in_current_session || 0);

        // --- SESSION TIMEOUT LOGIC (Pure Time-Based: 2 Minutes) ---
        if (ordersInCurrentSession > 0 && visitor.last_visit_at) {
            const lastVisit = new Date(visitor.last_visit_at);
            const now = new Date();
            const sessionTimeout = 2 * 60 * 1000; // 2 minutes (User Requested)

            if (now - lastVisit > sessionTimeout) {
                console.log(`[Loyalty Session] Timeout reached for visitor ${loyaltyId}. Resetting session orders.`);
                if (visitor.id) {
                    await query('UPDATE loyalty_visitors SET orders_in_current_session = 0 WHERE id = $1', [visitor.id]);
                }
                ordersInCurrentSession = 0;
            }
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

        // 4. Calculate total spending AND total completed orders count
        const orderStatsRes = await query(`
            SELECT 
                COUNT(*) as count,
                SUM(total_price) as total 
            FROM orders 
            WHERE restaurant_id = $1 AND loyalty_id = $2 AND status = 'completed'
        `, [targetRestaurantId, loyaltyId]);

        const totalCompletedOrders = parseInt(orderStatsRes.rows[0]?.count || 0);
        const totalSpending = parseFloat(orderStatsRes.rows[0]?.total || 0);

        // --- NEW: DETERMINISTIC STATE MACHINE ---
        // Priorities: WELCOME -> GIFT_AVAILABLE -> POINTS_PROGRESS -> ACTIVE_EARNING
        let uiState = 'ACTIVE_EARNING';
        if (totalCompletedOrders === 0) {
            uiState = 'WELCOME';
        } else if (activeGifts.length > 0) {
            uiState = 'GIFT_AVAILABLE';
        } else if (totalCompletedOrders >= 2) {
            // Check if we show progress bar (Session 4+ or late Session 3)
            uiState = 'POINTS_PROGRESS';
        } else {
            // Default for 1 order but no gift yet (e.g., Still in Session 1)
            uiState = 'ACTIVE_EARNING';
        }

        const eligibility = {
            canEarnPoints: loyaltyConfig.points_system_enabled !== false,
            canReceiveGift: totalCompletedOrders === 0 || (totalCompletedOrders >= 2), // Example logic
            canConvertGift: activeGifts.length > 0
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                totalPoints: totalPoints,
                totalVisits: visitCount,
                ordersInCurrentVisit: ordersInCurrentSession,
                totalCompletedOrders: totalCompletedOrders,
                sessionIsValid: ordersInCurrentSession > 0,
                activeGifts: activeGifts,
                loyalty_config: loyaltyConfig,
                totalSpending: totalSpending,
                uiState: uiState,
                eligibility: eligibility,

                // --- UI Helpers (MANDATORY: Used by the frontend for basic visibility) ---
                hasPlacedOrderInCurrentSession: ordersInCurrentSession > 0
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

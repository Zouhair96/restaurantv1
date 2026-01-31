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

        // --- SESSION CLUSTERING LOGIC ---
        // Rule: One Session = Max One Visit.
        // Rule: A session is active if now - last < SESSION_TIMEOUT
        // We derive "Visits" by grouping orders that happened close together.

        const SESSION_TIMEOUT = 3 * 60 * 1000; // 3 Minutes (Dev) - CHANGE TO 4 HOURS FOR PROD

        let visitCount = 0;
        let lastSessionTime = 0;
        let totalSpending = 0;

        for (const order of orders) {
            const orderTime = new Date(order.created_at).getTime();
            totalSpending += parseFloat(order.total_price) || 0;

            // If this order is far enough from the last "Session Start", it counts as a new visit.
            // If it's the first order, it's definitely a visit.
            if (visitCount === 0 || (orderTime - lastSessionTime > SESSION_TIMEOUT)) {
                visitCount++;
                lastSessionTime = orderTime; // Start of new session
            } else {
                // Same session. Update lastSessionTime? 
                // User said "now - last_session_at < timeout". 
                // Usually sliding window: each activity extends session. 
                // "Order Completion Flow... update last_session_at". Yes, extend it.
                lastSessionTime = orderTime;
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                completedOrders: orders.length,
                totalSpending: totalSpending,
                totalVisits: visitCount
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

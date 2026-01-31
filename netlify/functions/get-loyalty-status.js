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

        // --- STRICT SERVER-SIDE SESSION & VISIT LOGIC (DB-BACKED) ---
        const SESSION_TIMEOUT = 3 * 60 * 1000; // 3 Minutes (Dev) - Configurable
        const now = new Date();

        // 1. Get Visitor State (Persistent Session)
        let visitorRes = await query(`
            SELECT * FROM loyalty_visitors 
            WHERE restaurant_id = $1 AND device_id = $2
        `, [targetRestaurantId, loyaltyId]);

        let visitor = visitorRes.rows[0];
        let visitCount = 0;
        let ordersInCurrentSession = 0;
        // let currentStep = 'NEW'; // Not returned to Client yet, frontend determines from visitCount

        if (!visitor) {
            // New User: Create Record (Visit 0, Start Session)
            const insertRes = await query(`
                INSERT INTO loyalty_visitors (restaurant_id, device_id, visit_count, last_session_at, current_step, orders_in_current_session)
                VALUES ($1, $2, 0, NOW(), 'NEW', 0)
                RETURNING *
            `, [targetRestaurantId, loyaltyId]);
            visitor = insertRes.rows[0];
            visitCount = 0;
            ordersInCurrentSession = 0;
            // Existing User: Check Visit Window
            // We cluster based on the LAST VISIT (last visit-triggering order), 
            // NOT the last scan. This allows users to stay on page but get a new visit if they wait.
            const lastVisitTime = visitor.last_visit_at ? new Date(visitor.last_visit_at).getTime() : 0;
            const timeSinceLastVisit = lastVisitTime > 0 ? now.getTime() - lastVisitTime : SESSION_TIMEOUT + 1;

            console.log(`[Loyalty Scan] ID: ${loyaltyId}, Since Last Visit: ${Math.round(timeSinceLastVisit / 1000)}s, Limit: ${SESSION_TIMEOUT / 1000}s`);

            if (timeSinceLastVisit > SESSION_TIMEOUT) {
                // Potential New Visit Cluster detected
                console.log(`[Loyalty Scan] NEW VISIT WINDOW. Resetting session order count.`);
                visitCount = visitor.visit_count;
                ordersInCurrentSession = 0;

                await query(`
                    UPDATE loyalty_visitors 
                    SET last_session_at = NOW(), orders_in_current_session = 0
                    WHERE id = $1
                `, [visitor.id]);
            } else {
                // ACTIVE SESSION
                // Action: Extend session (keep alive)
                visitCount = visitor.visit_count;
                ordersInCurrentSession = visitor.orders_in_current_session;

                await query(`
                    UPDATE loyalty_visitors 
                    SET last_session_at = NOW()
                    WHERE id = $1
                `, [visitor.id]);
            }
        }

        // Return Authoritative Server State
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                completedOrders: orders.length, // Legacy/Display
                totalSpending: totalSpending,   // Legacy/Display
                totalVisits: visitCount,        // FROM DB (Authoritative)
                ordersInCurrentVisit: ordersInCurrentSession // FROM DB (Authoritative)
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

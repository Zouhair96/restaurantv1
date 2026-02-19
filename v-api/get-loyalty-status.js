import { query } from './db.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // --- Schema Maintenance (Safety Check) ---
        try {
            await query(`ALTER TABLE loyalty_visitors ADD COLUMN IF NOT EXISTS current_session_id TEXT`);
            await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS session_id TEXT`);
        } catch (dbErr) {
            console.warn('[DB Warning]: Could not ensure session schema:', dbErr.message);
        }

        const { loyaltyId, restaurantId, restaurantName } = req.query;

        if (!loyaltyId || (!restaurantId && !restaurantName)) {
            return res.status(400).json({ error: 'Missing loyaltyId or restaurant identifier' });
        }

        let targetRestaurantId = restaurantId;

        // Resolve Restaurant ID from Name if needed
        if (!targetRestaurantId && restaurantName) {
            const userRes = await query('SELECT id FROM users WHERE restaurant_name = $1', [restaurantName]);
            if (userRes.rows.length === 0) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }
            targetRestaurantId = userRes.rows[0].id;
        }

        // 1. Fetch Points & Visitor State
        const visitorRes = await query(`
            SELECT 
                id,
                total_points, 
                visit_count, 
                orders_in_current_session,
                last_visit_at,
                current_session_id
            FROM loyalty_visitors 
            WHERE restaurant_id = $1 AND device_id = $2
        `, [targetRestaurantId, loyaltyId]);

        let visitor = visitorRes.rows[0] || { total_points: 0, visit_count: 0, orders_in_current_session: 0, current_session_id: null };
        let totalPoints = parseInt(visitor.total_points || 0);
        let visitCount = parseInt(visitor.visit_count || 0);
        let ordersInCurrentSession = parseInt(visitor.orders_in_current_session || 0);
        const currentSessionIdFromVisitor = visitor.current_session_id;

        // --- SESSION TIMEOUT LOGIC ---
        if (ordersInCurrentSession > 0 && visitor.last_visit_at) {
            const lastVisit = new Date(visitor.last_visit_at);
            const now = new Date();
            const sessionTimeout = 1 * 60 * 1000; // 1 minute

            if (now - lastVisit > sessionTimeout) {
                if (visitor.id) {
                    await query('UPDATE loyalty_visitors SET orders_in_current_session = 0 WHERE id = $1', [visitor.id]);
                }
                ordersInCurrentSession = 0;
            }
        }

        // 2. Fetch Gifts
        const giftsRes = await query(`
            SELECT id, euro_value, type, percentage_value, gift_name, status, created_at 
            FROM gifts 
            WHERE device_id = $1 AND restaurant_id = $2 AND status IN ('unused', 'converted')
            ORDER BY created_at DESC
        `, [loyaltyId, targetRestaurantId]);
        const allGifts = giftsRes.rows;
        const activeGifts = allGifts.filter(g => g.status === 'unused');
        const convertedGifts = allGifts.filter(g => g.status === 'converted');

        // 3. Fetch Restaurant Config
        const configRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [targetRestaurantId]);
        const loyaltyConfig = configRes.rows[0]?.loyalty_config || { isAutoPromoOn: true };

        // 4. Calculate visit count
        const visitCountRes = await query(`
            SELECT COUNT(DISTINCT session_id) as count
            FROM orders
            WHERE restaurant_id = $1 AND loyalty_id = $2 AND status != 'cancelled'
        `, [targetRestaurantId, loyaltyId]);

        visitCount = parseInt(visitCountRes.rows[0]?.count || 0);

        if (ordersInCurrentSession > 0 && visitCount > 0) {
            const sessionInOrders = await query(`
                SELECT 1 FROM orders WHERE restaurant_id = $1 AND loyalty_id = $2 AND session_id = $3 LIMIT 1
            `, [targetRestaurantId, loyaltyId, currentSessionIdFromVisitor]);

            if (sessionInOrders.rows.length > 0) {
                visitCount -= 1;
            }
        }

        // 5. Calculate spending
        const orderStatsRes = await query(`
            SELECT
                status,
                COUNT(*) as count,
                SUM(total_price) as total
            FROM orders
            WHERE restaurant_id = $1 AND loyalty_id = $2
            GROUP BY status
        `, [targetRestaurantId, loyaltyId]);

        const stats = orderStatsRes.rows;
        const completed = stats.find(s => s.status === 'completed') || { count: 0, total: 0 };
        const active = stats.filter(s => ['pending', 'preparing', 'ready'].includes(s.status))
            .reduce((acc, curr) => ({
                count: acc.count + parseInt(curr.count),
                total: acc.total + parseFloat(curr.total)
            }), { count: 0, total: 0 });

        const totalCompletedOrders = parseInt(completed.count || 0);
        const totalSpending = parseFloat(completed.total || 0);
        const activeOrdersCount = active.count;
        const totalPotentialSpending = totalSpending + active.total;

        // --- STATE MACHINE ---
        let uiState = 'ACTIVE_EARNING';
        if (visitCount === 0) {
            uiState = 'WELCOME';
        } else if (visitCount === 1) {
            uiState = (ordersInCurrentSession > 0) ? 'ACTIVE_EARNING' : 'GIFT_AVAILABLE';
        } else if (visitCount === 2) {
            uiState = (ordersInCurrentSession > 0 || activeGifts.length === 0) ? 'POINTS_PROGRESS' : 'GIFT_AVAILABLE';
        } else {
            uiState = (ordersInCurrentSession > 0 || activeGifts.length === 0) ? 'POINTS_PROGRESS' : 'GIFT_AVAILABLE';
        }

        const eligibility = {
            canEarnPoints: loyaltyConfig.points_system_enabled !== false,
            canReceiveGift: totalCompletedOrders === 0 || totalCompletedOrders >= 2,
            canConvertGift: activeGifts.length > 0
        };

        return res.status(200).json({
            totalPoints: totalPoints,
            totalVisits: visitCount,
            ordersInCurrentVisit: ordersInCurrentSession,
            totalCompletedOrders: totalCompletedOrders,
            sessionIsValid: ordersInCurrentSession > 0,
            activeGifts: activeGifts,
            convertedGifts: convertedGifts,
            loyalty_config: loyaltyConfig,
            restaurantId: targetRestaurantId,
            totalSpending: totalSpending,
            totalPotentialSpending: totalPotentialSpending,
            activeOrdersCount: activeOrdersCount,
            uiState: uiState,
            eligibility: eligibility,
            hasPlacedOrderInCurrentSession: ordersInCurrentSession > 0
        });

    } catch (error) {
        console.error('Get Loyalty Status Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

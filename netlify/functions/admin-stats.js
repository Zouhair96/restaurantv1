import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    // 1. Check Method
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // 2. Verify Token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unauthorized: No token provided' })
        };
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Check Admin Role
        if (decoded.role !== 'admin') {
            return {
                statusCode: 403,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Forbidden: Admins only' })
            };
        }

        // 4. Fetch Stats using CTEs for efficiency
        const statsQuery = `
            WITH OrderStats AS (
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(commission_amount) as total_revenue,
                    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as monthly_orders,
                    SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN commission_amount ELSE 0 END) as monthly_revenue
                FROM orders
                WHERE status != 'cancelled'
            ),
            UserStats AS (
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_month
                FROM users
                WHERE role = 'restaurant'
            )
            SELECT 
                o.total_orders,
                o.total_revenue,
                o.monthly_orders,
                o.monthly_revenue,
                u.total_users,
                u.new_users_month
            FROM OrderStats o, UserStats u;
        `;

        const result = await query(statsQuery);
        const stats = result.rows[0];

        // Format for frontend
        const responseData = {
            total_revenue: parseFloat(stats.total_revenue || 0).toFixed(2),
            total_orders: parseInt(stats.total_orders || 0),
            monthly_revenue: parseFloat(stats.monthly_revenue || 0).toFixed(2),
            monthly_growth_users: parseInt(stats.new_users_month || 0)
        };

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        console.error('Admin Stats Error:', error.message);
        return {
            statusCode: 400, // Changed to 400 to differentiate from auth error
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to fetch stats' })
        };
    }
};

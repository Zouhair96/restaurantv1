import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });
        const decoded = jwt.verify(token, secret);

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

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
        const stats = result && result.rows && result.rows.length > 0 ? result.rows[0] : {};

        const responseData = {
            total_revenue: parseFloat(stats.total_revenue || 0).toFixed(2),
            total_orders: parseInt(stats.total_orders || 0),
            monthly_revenue: parseFloat(stats.monthly_revenue || 0).toFixed(2),
            monthly_growth_users: parseInt(stats.new_users_month || 0)
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Admin Stats Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

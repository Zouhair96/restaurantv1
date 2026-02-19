import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });

        const decoded = jwt.verify(token, secret);
        const restaurantId = decoded.restaurant_id;

        // Today
        const todayResult = await query(
            `SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND created_at >= CURRENT_DATE`,
            [restaurantId]
        );

        // Yesterday
        const yesterdayResult = await query(
            `SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE`,
            [restaurantId]
        );

        // Weekly
        const weeklyResult = await query(
            `SELECT DATE(created_at) as date, COALESCE(SUM(total_price), 0) as daily_total FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND created_at >= CURRENT_DATE - INTERVAL '6 days' GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`,
            [restaurantId]
        );

        const todaySales = parseFloat(todayResult.rows[0].total);
        const yesterdaySales = parseFloat(yesterdayResult.rows[0].total);

        let growth = 0;
        if (yesterdaySales > 0) growth = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
        else if (todaySales > 0) growth = 100;

        return res.status(200).json({
            todaySales,
            yesterdaySales,
            growth: parseFloat(growth.toFixed(1)),
            weeklyStats: weeklyResult.rows
        });

    } catch (error) {
        console.error('Sales Stats Error:', error);
        return res.status(500).json({ error: 'Sales statistics currently unavailable' });
    }
}

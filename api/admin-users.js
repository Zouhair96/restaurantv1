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

        const result = await query(`
            SELECT id, name, email, restaurant_name, role, 
                   subscription_plan, subscription_status, subscription_start_date, 
                   owed_commission_balance, created_at
            FROM users
            ORDER BY created_at DESC
        `);

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error('Admin Fetch Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

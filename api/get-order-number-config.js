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
        const restaurantId = decoded.id;

        const result = await query('SELECT order_number_config FROM users WHERE id = $1', [restaurantId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const config = result.rows[0].order_number_config || {
            starting_number: 1,
            current_number: 1,
            reset_period: 'never',
            weekly_start_day: 1,
            last_reset_date: null
        };

        return res.status(200).json({ config });

    } catch (error) {
        console.error('Get Order Number Config Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

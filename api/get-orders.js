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
        const restaurantId = (decoded.role === 'ADMIN') ? null : decoded.restaurant_id;

        let result;
        if (decoded.role === 'ADMIN') {
            result = await query('SELECT o.*, u.restaurant_name FROM orders o JOIN users u ON o.restaurant_id = u.id ORDER BY o.created_at DESC');
        } else {
            result = await query('SELECT * FROM orders WHERE restaurant_id = $1 ORDER BY created_at DESC', [restaurantId]);
        }

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error('Get Orders Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

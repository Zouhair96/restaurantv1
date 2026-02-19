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
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });

        const decoded = jwt.verify(token, secret);
        const { restaurantName } = req.query;

        if (!restaurantName) {
            return res.status(400).json({ error: 'Restaurant name is required' });
        }

        const restaurantResult = await query('SELECT id FROM users WHERE restaurant_name = $1', [restaurantName]);
        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const restaurantId = restaurantResult.rows[0].id;

        const ordersResult = await query(
            'SELECT * FROM orders WHERE customer_id = $1 AND restaurant_id = $2 ORDER BY created_at DESC',
            [decoded.id, restaurantId]
        );

        return res.status(200).json(ordersResult.rows);

    } catch (error) {
        console.error('Get Client Orders Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

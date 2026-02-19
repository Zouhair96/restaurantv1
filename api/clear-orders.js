import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
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

        const result = await query(
            'DELETE FROM orders WHERE restaurant_id = $1 RETURNING id',
            [restaurantId]
        );

        return res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.rowCount} orders`,
            deletedCount: result.rowCount
        });

    } catch (error) {
        console.error('Clear Orders Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

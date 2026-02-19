import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST' && req.method !== 'DELETE') {
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

        const result = await query('DELETE FROM visitor_events WHERE restaurant_id = $1', [restaurantId]);
        await query('DELETE FROM gifts WHERE restaurant_id = $1', [restaurantId]);
        await query('DELETE FROM points_transactions WHERE restaurant_id = $1', [restaurantId]);
        const visitorReset = await query('DELETE FROM loyalty_visitors WHERE restaurant_id = $1', [restaurantId]);

        await query(
            `UPDATE users 
             SET loyalty_config = jsonb_set(COALESCE(loyalty_config, '{}'::jsonb), '{last_reset_timestamp}', $1::jsonb) 
             WHERE id = $2`,
            [Date.now(), restaurantId]
        );

        return res.status(200).json({
            success: true,
            message: `Successfully reset loyalty data. Deleted ${result.rowCount} legacy events and ${visitorReset.rowCount} visitor records.`,
            deletedCount: result.rowCount,
            visitorsResetCount: visitorReset.rowCount
        });

    } catch (error) {
        console.error('Reset Loyalty Data Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

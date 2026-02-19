import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Missing token" });

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });

        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;

        const userResult = await query('SELECT id, restaurant_name, role FROM users WHERE id = $1', [userId]);
        const settingsResult = await query('SELECT * FROM integration_settings WHERE restaurant_id = $1', [userId]);

        return res.status(200).json({
            user: userResult.rows[0],
            settings: settingsResult.rows[0] || "No settings found in DB",
            server_time: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

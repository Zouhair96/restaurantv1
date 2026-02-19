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

        // Check if user is admin
        const userResult = await query('SELECT id, role, email, name, owed_commission_balance, stripe_payment_method_id FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await query('SELECT key, value FROM platform_settings');
        const settings = {};
        result.rows.forEach(row => {
            if ((row.key === 'stripe_secret_key' || row.key === 'stripe_webhook_secret') && row.value?.secret_key) {
                settings[row.key] = {
                    secret_key: '',
                    is_set: true
                };
            } else {
                settings[row.key] = row.value;
            }
        });

        return res.status(200).json({
            settings,
            user: userResult.rows[0]
        });
    } catch (error) {
        console.error('Get Admin Settings Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

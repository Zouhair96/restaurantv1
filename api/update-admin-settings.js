import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
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

        // Check if user is admin
        const userResult = await query('SELECT role FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        let { key, value } = req.body;

        if (!key || value === undefined) {
            return res.status(400).json({ error: 'Key and value are required' });
        }

        // Special handling for sensitive keys
        if (key === 'stripe_secret_key' || key === 'stripe_webhook_secret') {
            if (!value.secret_key || value.secret_key.trim() === '') {
                return res.status(200).json({ success: true, message: 'Skipped empty key' });
            }
            const { encrypt } = await import('./utils/encryption.js');
            const encryptedValue = encrypt(value.secret_key);
            value = { secret_key: encryptedValue, is_encrypted: true };
        }

        await query(
            `INSERT INTO platform_settings (key, value, updated_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (key) 
             DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
            [key, value]
        );

        return res.status(200).json({ success: true, message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Update Admin Settings Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

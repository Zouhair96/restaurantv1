import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });
        decoded = jwt.verify(token, secret);
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    if (decoded.role !== 'OWNER' && decoded.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Owners only' });
    }

    const ownerRestaurantId = decoded.restaurant_id;

    try {
        if (req.method === 'GET') {
            const result = await query(
                'SELECT id, name, role, is_active, created_at FROM users WHERE restaurant_id = $1 AND role = $2 ORDER BY created_at DESC',
                [ownerRestaurantId, 'STAFF']
            );
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const { name, pin } = req.body;
            if (!name || !pin || pin.length !== 4) {
                return res.status(400).json({ error: 'Name and 4-digit PIN required' });
            }

            const existingStaff = await query(
                'SELECT id, pin_hash FROM users WHERE restaurant_id = $1 AND role = $2 AND is_active = true',
                [ownerRestaurantId, 'STAFF']
            );

            for (const staff of existingStaff.rows) {
                const isMatch = await bcrypt.compare(pin, staff.pin_hash);
                if (isMatch) {
                    return res.status(409).json({ error: 'This PIN is already in use by another staff member.' });
                }
            }

            const pinHash = await bcrypt.hash(pin, 10);
            const dummyEmail = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@internal.com`;

            const newUser = await query(
                'INSERT INTO users (name, email, password_hash, role, login_type, pin_hash, restaurant_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, role, is_active',
                [name, dummyEmail, 'INTERNAL_ONLY', 'STAFF', 'PIN', pinHash, ownerRestaurantId, true]
            );

            return res.status(201).json(newUser.rows[0]);
        }

        if (req.method === 'PATCH') {
            const { id, is_active } = req.body;
            const check = await query('SELECT id FROM users WHERE id = $1 AND restaurant_id = $2', [id, ownerRestaurantId]);
            if (check.rows.length === 0) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            await query('UPDATE users SET is_active = $1 WHERE id = $2', [is_active, id]);
            return res.status(200).json({ success: true });
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            const check = await query('SELECT id FROM users WHERE id = $1 AND restaurant_id = $2', [id, ownerRestaurantId]);
            if (check.rows.length === 0) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            await query('DELETE FROM users WHERE id = $1', [id]);
            return res.status(200).json({ success: true, message: 'Staff member removed' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Staff Management Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

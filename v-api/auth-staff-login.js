import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { pin, restaurant_id } = req.body;

        if (!pin || !restaurant_id) {
            return res.status(400).json({ error: 'PIN and Restaurant ID are required' });
        }

        // 1. Fetch all active staff for this restaurant
        const result = await query(
            'SELECT id, name, pin_hash, role, restaurant_id FROM users WHERE restaurant_id = $1 AND role = $2 AND is_active = true',
            [restaurant_id, 'STAFF']
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid PIN or Restaurant ID' });
        }

        // 2. Find matching staff member by PIN
        let matchingStaff = null;
        for (const staff of result.rows) {
            const isMatch = await bcrypt.compare(pin, staff.pin_hash);
            if (isMatch) {
                matchingStaff = staff;
                break;
            }
        }

        if (!matchingStaff) {
            return res.status(401).json({ error: 'Invalid PIN or Restaurant ID' });
        }

        // 3. Create Token
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });

        const token = jwt.sign(
            {
                id: matchingStaff.id,
                role: 'STAFF',
                restaurant_id: matchingStaff.restaurant_id,
                name: matchingStaff.name
            },
            secret,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            token,
            user: {
                id: matchingStaff.id,
                name: matchingStaff.name,
                role: 'STAFF',
                restaurant_id: matchingStaff.restaurant_id
            }
        });

    } catch (error) {
        console.error('Staff Login Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

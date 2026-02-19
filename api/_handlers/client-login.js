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
        const { email, password, restaurantName } = req.body;

        if (!email || !password || !restaurantName) {
            return res.status(400).json({ error: 'Email, password, and restaurant name are required' });
        }

        // 1. Find the restaurant
        const restaurantResult = await query(
            'SELECT id FROM users WHERE restaurant_name = $1',
            [restaurantName]
        );

        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const restaurantId = restaurantResult.rows[0].id;

        // 2. Find user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || user.role !== 'client') {
            return res.status(401).json({ error: 'Invalid credentials or user type' });
        }

        // 3. Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 4. Create Token
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, restaurantId: restaurantId },
            secret,
            { expiresIn: '7d' }
        );

        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            registered_at_restaurant_id: user.registered_at_restaurant_id
        };

        return res.status(200).json({ token, user: userInfo });

    } catch (error) {
        console.error('Client Login Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

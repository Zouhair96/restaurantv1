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
        const { name, email, password, restaurantName } = req.body;

        if (!email || !password || !restaurantName) {
            return res.status(400).json({ error: 'Email, password, and restaurant name are required' });
        }

        const restaurantResult = await query('SELECT id FROM users WHERE restaurant_name = $1', [restaurantName]);
        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const restaurantId = restaurantResult.rows[0].id;

        const checkUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            const user = checkUser.rows[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) return res.status(409).json({ error: 'User already exists' });

            const secret = process.env.JWT_SECRET;
            if (!secret) return res.status(500).json({ error: 'Server configuration error' });
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role, restaurantId }, secret, { expiresIn: '7d' });
            return res.status(200).json({ token, user });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await query(
            'INSERT INTO users (name, email, password_hash, role, registered_at_restaurant_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, registered_at_restaurant_id',
            [name, email, passwordHash, 'client', restaurantId]
        );

        const user = newUser.rows[0];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, restaurantId: user.registered_at_restaurant_id }, secret, { expiresIn: '7d' });

        return res.status(201).json({ token, user });

    } catch (error) {
        console.error('Client Signup Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

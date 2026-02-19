import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || user.is_active === false) {
            return res.status(401).json({ error: !user ? 'Invalid credentials' : 'Account is disabled. Please contact your administrator.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create Token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, restaurant_id: user.restaurant_id || user.id },
            secret,
            { expiresIn: '7d' }
        );

        // Return user info (excluding hash)
        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            restaurant_name: user.restaurant_name,
            restaurant_id: user.restaurant_id || user.id,
            subscription_status: user.subscription_status,
            subscription_plan: user.subscription_plan,
            role: user.role
        };

        return res.status(200).json({ token, user: userInfo });

    } catch (error) {
        console.error('Login Error:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}

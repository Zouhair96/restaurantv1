import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        const { name, email, password, restaurantName, address, phoneNumber } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Security Hardening: Input Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Check if user exists
        const checkUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await query(
            'INSERT INTO users (name, email, password_hash, restaurant_name, address, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, restaurant_name, role, stripe_payment_method_id',
            [name, email, passwordHash, restaurantName, address, phoneNumber]
        );

        const user = newUser.rows[0];

        // Create Token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: '1h' }
        );

        return res.status(201).json({ token, user });

    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}

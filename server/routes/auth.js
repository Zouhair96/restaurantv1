import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();

// Signup Route
router.post('/auth-signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const userCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await query(
            `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, name, email, role, subscription_plan, subscription_status`,
            [name, email, passwordHash]
        );

        const user = newUser.rows[0];

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, user });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Login Route
router.post('/auth-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find User
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user info (excluding password)
        const { password_hash, ...userInfo } = user;

        res.status(200).json({ token, user: userInfo });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

export default router;

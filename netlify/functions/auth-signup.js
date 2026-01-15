import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Method Not Allowed' })
            };
        }

        const { name, email, password, restaurantName, address, phoneNumber } = JSON.parse(event.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Email and password are required' })
            };
        }

        // Security Hardening: Input Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid email format' })
            };
        }

        if (password.length < 8) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Password must be at least 8 characters long' })
            };
        }

        // Check if user exists
        const checkUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return {
                statusCode: 409,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'User already exists' })
            };
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await query(
            'INSERT INTO users (name, email, password_hash, restaurant_name, address, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, restaurant_name, role',
            [name, email, passwordHash, restaurantName, address, phoneNumber]
        );

        const user = newUser.rows[0];

        // Create Token
        // REVERT: Use fallback if missing
        const secret = process.env.JWT_SECRET || 'secret_fallback_key_12345';

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret, // Use variable
            { expiresIn: '1h' }
        );

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, user }),
        };

    } catch (error) {
        console.error('Signup Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal Server Error',
                details: error.message,
                stack: error.stack // Parsing errors often need stack to identify source
            })
        };
    }
};

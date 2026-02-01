import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

export const handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Method Not Allowed' })
            };
        }

        const { email, password } = JSON.parse(event.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Email and password are required' })
            };
        }

        // Find user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || user.is_active === false) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: !user ? 'Invalid credentials' : 'Account is disabled. Please contact your administrator.' })
            };
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        // Create Token
        const secret = process.env.JWT_SECRET || 'your-secret-key';

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

        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ token, user: userInfo }),
        };

    } catch (error) {
        console.error('Login Error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal Server Error',
                details: error.message
            })
        };
    }
};

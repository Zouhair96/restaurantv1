import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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

        const { email, password, restaurantName } = JSON.parse(event.body);

        if (!email || !password || !restaurantName) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Email, password, and restaurant name are required' })
            };
        }

        // 1. Find the restaurant
        const restaurantResult = await query(
            'SELECT id FROM users WHERE restaurant_name = $1',
            [restaurantName]
        );

        if (restaurantResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Restaurant not found' })
            };
        }

        const restaurantId = restaurantResult.rows[0].id;

        // 2. Find user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        // 3. Verify user type and restaurant linkage
        // Ensure the user is a client and potentially linked to this restaurant
        // Or at least is a client (a client could potentially log in at different restaurants)
        if (user.role !== 'client') {
            return {
                statusCode: 403,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Access denied. Use the main portal for restaurant management.' })
            };
        }

        // 4. Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        // 5. Create Token
        const secret = process.env.JWT_SECRET;
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

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, user: userInfo }),
        };

    } catch (error) {
        console.error('Client Login Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

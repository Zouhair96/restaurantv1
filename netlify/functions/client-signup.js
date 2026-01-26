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

        const { name, email, password, restaurantName } = JSON.parse(event.body);

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

        // 2. Check if user exists
        const checkUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            const user = checkUser.rows[0];

            // Verify password for existing user
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return {
                    statusCode: 409,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'User already exists with this email' })
                };
            }

            // User exists and password matches - return token as if they just registered
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, restaurantId: restaurantId },
                secret,
                { expiresIn: '7d' }
            );

            return {
                statusCode: 200, // Success (Login proxy)
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, user }),
            };
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Insert client user
        const newUser = await query(
            'INSERT INTO users (name, email, password_hash, role, registered_at_restaurant_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, registered_at_restaurant_id',
            [name, email, passwordHash, 'client', restaurantId]
        );

        const user = newUser.rows[0];

        // 5. Create Token
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET missing");

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, restaurantId: user.registered_at_restaurant_id },
            secret,
            { expiresIn: '7d' } // Clients stay logged in longer
        );

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, user }),
        };

    } catch (error) {
        console.error('Client Signup Error:', error);
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

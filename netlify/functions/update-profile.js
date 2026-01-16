import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'PATCH') {
            return {
                statusCode: 405,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Method Not Allowed' })
            };
        }

        const authHeader = event.headers.authorization;
        if (!authHeader) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'No token provided' })
            };
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        let decoded;

        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }

        const userId = decoded.id;
        const { name, restaurantName, address, phoneNumber } = JSON.parse(event.body);

        // Update user
        const result = await query(
            `UPDATE users 
             SET name = $1, restaurant_name = $2, address = $3, phone_number = $4 
             WHERE id = $5 
             RETURNING id, name, email, restaurant_name, address, phone_number, role, subscription_plan, subscription_status`,
            [name, restaurantName, address, phoneNumber, userId]
        );

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'User not found' })
            };
        }

        const user = result.rows[0];

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Profile updated successfully', user }),
        };

    } catch (error) {
        console.error('Update Profile Error:', error);
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

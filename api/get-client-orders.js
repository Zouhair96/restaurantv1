import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Method Not Allowed' })
            };
        }

        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Unauthorized' })
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
                body: JSON.stringify({ error: 'Invalid or expired token' })
            };
        }

        const { restaurantName } = event.queryStringParameters || {};
        if (!restaurantName) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Restaurant name is required' })
            };
        }

        // Find restaurant ID
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

        // Fetch orders for this customer at this restaurant
        const ordersResult = await query(
            'SELECT * FROM orders WHERE customer_id = $1 AND restaurant_id = $2 ORDER BY created_at DESC',
            [decoded.id, restaurantId]
        );

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ordersResult.rows),
        };

    } catch (error) {
        console.error('Get Client Orders Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

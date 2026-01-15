import { query } from './db.js';
import jwt from 'jsonwebtoken';

export const handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // 1. Verify Token
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Unauthorized: Missing token' })
            };
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET missing");
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;

        // 2. Extract Data
        const { plan, paymentMethod } = JSON.parse(event.body);

        // Handle if plan is an object (new way) or string (old way)
        const planName = typeof plan === 'object' ? plan.name : plan;

        if (!plan) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Plan details required' })
            };
        }

        // 3. Update Database
        // We update the subscription fields for the user
        const updateQuery = `
            UPDATE users 
            SET subscription_plan = $1, 
            subscription_status = 'active', 
            subscription_start_date = NOW() 
            WHERE id = $2
            RETURNING id, name, email, restaurant_name, subscription_plan, subscription_status
        `;

        const result = await query(updateQuery, [planName, userId]);

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'User not found' })
            };
        }

        const updatedUser = result.rows[0];

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Subscription successful',
                user: updatedUser
            }),
        };

    } catch (error) {
        console.error('Subscription Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal Server Error'
            })
        };
    }
};

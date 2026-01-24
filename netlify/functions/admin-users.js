import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    // 1. Check Method
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // 2. Verify Token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unauthorized: No token provided' })
        };
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Check Admin Role
        if (decoded.role !== 'admin') {
            return {
                statusCode: 403,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Forbidden: Admins only' })
            };
        }

        // 4. Fetch Users
        const text = `
            SELECT id, name, email, restaurant_name, role, 
                   subscription_plan, subscription_status, subscription_start_date, 
                   owed_commission_balance, created_at
            FROM users
            ORDER BY created_at DESC
        `;
        const result = await query(text);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.rows)
        };

    } catch (error) {
        console.error('Admin Fetch Error:', error.message);
        return {
            statusCode: 500, // Return server error so frontend doesn't think it's just a logout
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

import { query } from './db.js';
import jwt from 'jsonwebtoken';

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
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET missing");
        const decoded = jwt.verify(token, secret);

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
                   subscription_plan, subscription_status, subscription_start_date, created_at
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
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
        };
    }
};

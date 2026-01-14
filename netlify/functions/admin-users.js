const { query } = require('./db');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    // 1. Check Method
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 2. Verify Token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: No token provided' }) };
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');

        // 3. Check Admin Role
        if (decoded.role !== 'admin') {
            return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden: Admins only' }) };
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
        console.error('Admin Fetch Error:', error);
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
        };
    }
};

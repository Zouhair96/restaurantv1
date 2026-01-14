const { query } = require('./db');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Verify Token
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: Missing token' }) };
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET missing");
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;

        // 2. Update Database
        // We set subscription fields to null/inactive
        const updateQuery = `
            UPDATE users 
            SET subscription_plan = NULL, 
                subscription_status = 'inactive', 
                subscription_start_date = NULL
            WHERE id = $1
            RETURNING id, name, email, restaurant_name, subscription_plan, subscription_status
        `;

        const result = await query(updateQuery, [userId]);

        if (result.rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
        }

        const updatedUser = result.rows[0];

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Unsubscription successful',
                user: updatedUser
            }),
        };

    } catch (error) {
        console.error('Unsubscription Error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal Server Error'
            })
        };
    }
};

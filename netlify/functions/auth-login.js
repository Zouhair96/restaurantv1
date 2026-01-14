const { query } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Email and password are required' }) };
    }

    try {
        // Find user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
        }

        // Create Token
        if (!process.env.JWT_SECRET) {
            throw new Error("CRITICAL: JWT_SECRET is missing.");
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return user info (excluding hash)
        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            restaurant_name: user.restaurant_name,
            subscription_status: user.subscription_status,
            subscription_plan: user.subscription_plan,
            subscription_start_date: user.subscription_start_date,
            role: user.role
        };

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, user: userInfo }),
        };

    } catch (error) {
        console.error('Login Error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal Server Error'
                // details/stack removed
            })
        };
    }
};

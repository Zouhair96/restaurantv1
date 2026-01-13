const { query } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { name, email, password, restaurantName } = JSON.parse(event.body);

    if (!email || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Email and password are required' }) };
    }

    try {
        // Check if user exists
        const checkUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return { statusCode: 409, body: JSON.stringify({ error: 'User already exists' }) };
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await query(
            'INSERT INTO users (name, email, password_hash, restaurant_name) VALUES ($1, $2, $3, $4) RETURNING id, name, email, restaurant_name',
            [name, email, passwordHash, restaurantName]
        );

        const user = newUser.rows[0];

        // Create Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret_fallback', // Fallback for dev only
            { expiresIn: '1h' }
        );

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, user }),
        };

    } catch (error) {
        console.error('Signup Error:', error);
        return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

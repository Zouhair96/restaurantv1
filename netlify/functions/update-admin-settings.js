import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user is admin
        const userResult = await query('SELECT role FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
        }

        const { key, value } = JSON.parse(event.body);

        if (!key || value === undefined) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Key and value are required' }) };
        }

        await query(
            `INSERT INTO platform_settings (key, value, updated_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (key) 
             DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
            [key, value]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Setting updated successfully' })
        };
    } catch (error) {
        console.error('Update Admin Settings Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

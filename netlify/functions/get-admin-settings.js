import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user is admin
        const userResult = await query('SELECT id, role, email, name, owed_commission_balance, stripe_payment_method_id FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
        }

        const result = await query('SELECT key, value FROM platform_settings');
        const settings = {};
        result.rows.forEach(row => {
            if ((row.key === 'stripe_secret_key' || row.key === 'stripe_webhook_secret') && row.value?.secret_key) {
                settings[row.key] = {
                    secret_key: '',
                    is_set: true
                };
            } else {
                settings[row.key] = row.value;
            }
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                settings,
                user: userResult.rows[0]
            })
        };
    } catch (error) {
        console.error('Get Admin Settings Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

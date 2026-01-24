import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config({ path: './.env' });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    // Helper for auth
    const authHeader = event.headers.authorization || event.headers.Authorization;
    let user = null;
    if (authHeader) {
        try {
            const token = authHeader.split(' ')[1];
            if (token && token !== 'null' && token !== 'undefined') {
                user = jwt.verify(token, JWT_SECRET);
            }
        } catch (err) {
            console.error('[Templates Auth Error]:', err.message);
        }
    }

    try {
        if (event.httpMethod === 'GET') {
            const plan = event.queryStringParameters?.plan || '';

            let sql = 'SELECT * FROM templates WHERE status = $1';
            let params = ['active'];

            // Filter if plan is provided AND user is not admin
            if (plan && (!user || user.role !== 'admin')) {
                sql += ' AND allowed_plans ? $2';
                params.push(plan.toLowerCase());
            }

            const result = await query(sql, params);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.rows)
            };
        }

        if (event.httpMethod === 'POST') {
            if (!user || user.role !== 'admin') {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized: Admin access required' }) };
            }

            if (!event.body) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing request body' }) };
            }

            let payload;
            try {
                payload = JSON.parse(event.body);
            } catch (e) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
            }

            const { id, allowed_plans } = payload;
            if (id === undefined || !allowed_plans) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id or allowed_plans' }) };
            }

            const targetId = parseInt(id);
            if (isNaN(targetId)) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID must be an integer' }) };
            }

            const q = 'UPDATE templates SET allowed_plans = $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING *';
            const result = await query(q, [JSON.stringify(allowed_plans), targetId]);

            if (result.rowCount === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Template not found' }) };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.rows[0])
            };
        }

        if (event.httpMethod === 'DELETE') {
            if (!user || user.role !== 'admin') {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
            }

            const { id } = JSON.parse(event.body);
            const targetId = parseInt(id);
            const sql = 'DELETE FROM templates WHERE id = $1 RETURNING *';
            const result = await query(sql, [targetId]);

            if (result.rowCount === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Template not found' }) };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Template deleted' })
            };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    } catch (error) {
        console.error('[Templates CRITICAL ERROR]:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Operation Failed',
                message: error.message,
                details: 'Please check database triggers and constraints.'
            })
        };
    }
};

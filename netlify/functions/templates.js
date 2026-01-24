import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    const { httpMethod, headers, queryStringParameters, body } = event;

    // Helper for auth
    const authHeader = headers.authorization || headers.Authorization;
    let user = null;
    if (authHeader) {
        try {
            const token = authHeader.split(' ')[1];
            user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.error('JWT Error:', err);
        }
    }

    try {
        if (httpMethod === 'GET') {
            const plan = queryStringParameters?.plan;
            let query = 'SELECT * FROM templates WHERE status = $1';
            let params = ['active'];

            if (plan && user?.role !== 'admin') {
                // For restaurants, only show allowed plans
                query += ' AND allowed_plans ? $2';
                params.push(plan.toLowerCase());
            }

            const result = await pool.query(query, params);
            return {
                statusCode: 200,
                body: JSON.stringify(result.rows),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        if (httpMethod === 'POST') {
            // Admin only check
            if (!user || user.role !== 'admin') {
                return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized' }) };
            }

            const { id, allowed_plans } = JSON.parse(body);
            if (!id || !allowed_plans) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
            }

            const query = 'UPDATE templates SET allowed_plans = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
            const result = await pool.query(query, [JSON.stringify(allowed_plans), id]);

            if (result.rowCount === 0) {
                return { statusCode: 404, body: JSON.stringify({ error: 'Template not found' }) };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(result.rows[0]),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};

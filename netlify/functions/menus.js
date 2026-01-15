import { query } from './db.js';
import jwt from 'jsonwebtoken';

// Helper to verify token
const getUserFromToken = (headers) => {
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("CRITICAL: JWT_SECRET missing in menus.js");
            return null;
        }
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (e) {
        return null;
    }
};

export const handler = async (event, context) => {
    // Check Auth
    const user = getUserFromToken(event.headers);
    if (!user) {
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    const { httpMethod } = event;

    try {
        // --- GET: List all menus for user ---
        if (httpMethod === 'GET') {
            const result = await query(
                'SELECT * FROM menus WHERE user_id = $1 ORDER BY updated_at DESC',
                [user.id]
            );
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.rows)
            };
        }

        // --- POST: Create new menu ---
        if (httpMethod === 'POST') {
            const { name, templateType, config } = JSON.parse(event.body);

            if (!name || !config) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Name and config are required' })
                };
            }

            const result = await query(
                'INSERT INTO menus (user_id, name, template_type, config) VALUES ($1, $2, $3, $4) RETURNING *',
                [user.id, name, templateType || 'custom', JSON.stringify(config)]
            );

            return {
                statusCode: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.rows[0])
            };
        }

        // --- PUT: Update existing menu ---
        if (httpMethod === 'PUT') {
            const { id, name, config } = JSON.parse(event.body);

            if (!id || !config) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'ID and config are required' })
                };
            }

            // Verify ownership first
            const check = await query('SELECT * FROM menus WHERE id = $1 AND user_id = $2', [id, user.id]);
            if (check.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Menu not found' })
                };
            }

            const result = await query(
                'UPDATE menus SET name = $1, config = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
                [name || check.rows[0].name, JSON.stringify(config), id]
            );

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.rows[0])
            };
        }

        // --- DELETE: Delete menu ---
        if (httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);

            const result = await query(
                'DELETE FROM menus WHERE id = $1 AND user_id = $2 RETURNING id',
                [id, user.id]
            );

            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Menu not found' })
                };
            }

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Menu deleted', id })
            };
        }

        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };

    } catch (error) {
        console.error('API Error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

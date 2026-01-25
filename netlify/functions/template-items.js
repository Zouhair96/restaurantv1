import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    // Verify Token & Admin Role
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
        }

        if (event.httpMethod === 'POST') {
            const { template_id, category, name, description, price, image_url, sort_order } = JSON.parse(event.body);
            const res = await query(
                'INSERT INTO template_items (template_id, category, name, description, price, image_url, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [template_id, category, name, description, price, image_url, sort_order || 0]
            );
            return { statusCode: 201, headers, body: JSON.stringify(res.rows[0]) };
        }

        if (event.httpMethod === 'PATCH') {
            const { id, category, name, description, price, image_url, sort_order } = JSON.parse(event.body);
            const res = await query(
                'UPDATE template_items SET category = $1, name = $2, description = $3, price = $4, image_url = $5, sort_order = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
                [category, name, description, price, image_url, sort_order, id]
            );
            return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };
        }

        if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);
            // Soft Delete Policy: Mark as is_deleted instead of physical removal
            await query('UPDATE template_items SET is_deleted = true, updated_at = NOW() WHERE id = $1', [id]);
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Item soft-deleted' }) };
        }

    } catch (error) {
        console.error('Template Items Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

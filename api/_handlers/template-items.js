import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server configuration error' });

    try {
        const decoded = jwt.verify(token, secret);
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

        if (req.method === 'POST') {
            const { template_id, category, category_en, name, name_en, description, description_en, price, image_url, sort_order } = req.body;
            const result = await query(
                'INSERT INTO template_items (template_id, category, category_en, name, name_en, description, description_en, price, image_url, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
                [template_id, category, category_en, name, name_en, description, description_en, price, image_url, sort_order || 0]
            );
            return res.status(201).json(result.rows[0]);
        }

        if (req.method === 'PATCH') {
            const { id, category, category_en, name, name_en, description, description_en, price, image_url, sort_order } = req.body;
            const result = await query(
                'UPDATE template_items SET category = $1, category_en = $2, name = $3, name_en = $4, description = $5, description_en = $6, price = $7, image_url = $8, sort_order = $9, updated_at = NOW() WHERE id = $10 RETURNING *',
                [category, category_en, name, name_en, description, description_en, price, image_url, sort_order, id]
            );
            return res.status(200).json(result.rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            await query('UPDATE template_items SET is_deleted = true, updated_at = NOW() WHERE id = $1', [id]);
            return res.status(200).json({ success: true, message: 'Item soft-deleted' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Template Items Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

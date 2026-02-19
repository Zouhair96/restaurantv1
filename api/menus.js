import { query } from './db.js';
import jwt from 'jsonwebtoken';

const getUserFromToken = (headers) => {
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;
        return jwt.verify(token, secret);
    } catch (e) {
        console.error("JWT Error:", e.message);
        return null;
    }
};

export default async function handler(req, res) {
    const user = getUserFromToken(req.headers);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        if (req.method === 'GET') {
            const userRes = await query('SELECT role, subscription_plan FROM users WHERE id = $1', [user.id]);
            const dbUser = userRes.rows[0];
            const plan = dbUser.subscription_plan?.toLowerCase() || 'starter';

            const result = await query(
                `SELECT m.* 
                 FROM menus m
                 JOIN templates t ON m.template_type = t.template_key
                 WHERE m.user_id = $1 
                 AND (t.allowed_plans ? $2 OR $3 = 'admin')
                 ORDER BY m.updated_at DESC`,
                [user.id, plan, dbUser.role]
            );
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const { name, templateType, config } = req.body;
            if (!name || !config) {
                return res.status(400).json({ error: 'Name and config are required' });
            }

            await query(`UPDATE restaurant_templates SET status = 'inactive' WHERE restaurant_id = $1`, [user.id]);
            const templateRes = await query('SELECT id FROM templates WHERE template_key = $1', [templateType || 'pizza1']);
            const templateId = templateRes.rows[0]?.id;

            if (templateId) {
                await query(
                    `INSERT INTO restaurant_templates (restaurant_id, template_id, status, subscription_tier)
                     VALUES ($1, $2, 'active', 'starter')
                     ON CONFLICT (restaurant_id, template_id)
                     DO UPDATE SET status = 'active', updated_at = NOW()`,
                    [user.id, templateId]
                );
            }

            const existingMenuRes = await query('SELECT id FROM menus WHERE user_id = $1 AND template_type = $2', [user.id, templateType || 'custom']);
            let result;
            if (existingMenuRes.rows.length > 0) {
                result = await query(`UPDATE menus SET name = $1, config = $2, updated_at = NOW() WHERE id = $3 RETURNING *`, [name, config, existingMenuRes.rows[0].id]);
            } else {
                result = await query(`INSERT INTO menus (user_id, name, template_type, config) VALUES ($1, $2, $3, $4) RETURNING *`, [user.id, name, templateType || 'custom', config]);
            }
            return res.status(201).json(result.rows[0]);
        }

        if (req.method === 'PUT') {
            const { id, name, config } = req.body;
            if (!id || !config) {
                return res.status(400).json({ error: 'ID and config are required' });
            }
            const check = await query('SELECT * FROM menus WHERE id = $1 AND user_id = $2', [id, user.id]);
            if (check.rows.length === 0) {
                return res.status(404).json({ error: 'Menu not found' });
            }
            const result = await query('UPDATE menus SET name = $1, config = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *', [name || check.rows[0].name, config, id]);
            return res.status(200).json(result.rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            const result = await query('DELETE FROM menus WHERE id = $1 AND user_id = $2 RETURNING id', [id, user.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Menu not found' });
            }
            return res.status(200).json({ message: 'Menu deleted', id });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

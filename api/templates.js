import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const authHeader = req.headers.authorization;
    let user = null;
    const secret = process.env.JWT_SECRET;
    if (authHeader && secret) {
        try {
            const token = authHeader.split(' ')[1];
            if (token && token !== 'null' && token !== 'undefined') {
                user = jwt.verify(token, secret);
            }
        } catch (err) {
            console.error('[Templates Auth Error]:', err.message);
        }
    }

    try {
        if (req.method === 'GET') {
            const plan = req.query.plan || '';
            const templateKey = req.query.templateKey || '';

            let sql = 'SELECT * FROM templates WHERE status = $1 AND template_key IN ($2, $3, $4)';
            let params = ['active', 'pizza1', 'testemplate', 'pizzaFun'];
            let paramIndex = 5;

            if (templateKey) {
                sql += ` AND template_key = $${paramIndex++}`;
                params.push(templateKey);
            }

            if (plan && (!user || user.role !== 'admin')) {
                sql += ` AND allowed_plans ? $${paramIndex++}`;
                params.push(plan.toLowerCase());
            }

            const templatesResult = await query(sql, params);
            let restaurantTemplates = [];
            if (user && user.role !== 'admin') {
                const rtRes = await query('SELECT * FROM restaurant_templates WHERE restaurant_id = $1 AND status = $2', [user.id, 'active']);
                restaurantTemplates = rtRes.rows;
            }

            const templates = [];
            for (const template of templatesResult.rows) {
                const isActivated = user?.role === 'admin' || (user && restaurantTemplates.some(rt => rt.template_id === template.id));
                const itemsResult = await query('SELECT * FROM template_items WHERE template_id = $1 AND is_deleted = false ORDER BY sort_order, id', [template.id]);
                templates.push({ ...template, is_activated: isActivated, items: itemsResult.rows });
            }

            if (templateKey && templates.length === 0) return res.status(403).json({ error: 'Access Denied' });
            return res.status(200).json(templateKey ? (templates[0] || null) : templates);
        }

        if (req.method === 'POST') {
            if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
            const { id, allowed_plans, config, name, icon, template_key, base_layout, status } = req.body;

            if (!id) {
                const resInsert = await query(
                    `INSERT INTO templates (name, template_key, icon, allowed_plans, config, base_layout, status, created_at, updated_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
                    [name, template_key, icon || '🍽️', JSON.stringify(allowed_plans || []), JSON.stringify(config || {}), base_layout || 'grid', status || 'active']
                );
                return res.status(201).json(resInsert.rows[0]);
            }

            const updates = [];
            const sqlParams = [];
            let pIdx = 1;
            if (allowed_plans !== undefined) { updates.push(`"allowed_plans" = $${pIdx++}::jsonb`); sqlParams.push(JSON.stringify(allowed_plans)); }
            if (config !== undefined) { updates.push(`"config" = $${pIdx++}::jsonb`); sqlParams.push(JSON.stringify(config)); }
            if (name !== undefined) { updates.push(`"name" = $${pIdx++}`); sqlParams.push(name); }
            if (icon !== undefined) { updates.push(`"icon" = $${pIdx++}`); sqlParams.push(icon); }
            if (template_key !== undefined) { updates.push(`"template_key" = $${pIdx++}`); sqlParams.push(template_key); }
            if (base_layout !== undefined) { updates.push(`"base_layout" = $${pIdx++}`); sqlParams.push(base_layout); }
            if (status !== undefined) { updates.push(`"status" = $${pIdx++}`); sqlParams.push(status); }

            if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
            sqlParams.push(id);
            const result = await query(`UPDATE templates SET ${updates.join(', ')}, "updated_at" = NOW() WHERE "id" = $${pIdx} RETURNING *`, sqlParams);
            return res.status(200).json(result.rows[0]);
        }

        if (req.method === 'DELETE') {
            if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
            const { id } = req.body;
            await query('DELETE FROM templates WHERE id = $1', [id]);
            return res.status(200).json({ message: 'Template deleted' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Templates Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

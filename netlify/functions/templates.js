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
            const templateKey = event.queryStringParameters?.templateKey || '';
            const restaurantId = user?.id;

            let sql = 'SELECT * FROM templates WHERE status = $1';
            let params = ['active'];
            let paramIndex = 2;

            if (templateKey) {
                sql += ` AND template_key = $${paramIndex++}`;
                params.push(templateKey);
            }

            // Filter if plan is provided AND user is not admin
            if (plan && (!user || user.role !== 'admin')) {
                sql += ` AND allowed_plans ? $${paramIndex++}`;
                params.push(plan.toLowerCase());
            }

            const templatesResult = await query(sql, params);

            // Fetch activation status if user is a restaurant
            let restaurantTemplates = [];
            if (user && user.role !== 'admin') {
                const rtRes = await query('SELECT * FROM restaurant_templates WHERE restaurant_id = $1 AND status = $2', [user.id, 'active']);
                restaurantTemplates = rtRes.rows;
            }

            // For each template, fetch its items (respecting soft-delete)
            const templates = [];
            for (const template of templatesResult.rows) {
                // Subscription check for specific template if requested
                const isActivated = user?.role === 'admin' || (user && restaurantTemplates.some(rt => rt.template_id === template.id));

                // If fetching a single template specifically (usually by templateKey), 
                // we allow it for the "Public Master Preview" regardless of session.
                if (templateKey) {
                    // Allowed publicly for preview
                }

                const itemsResult = await query(
                    'SELECT * FROM template_items WHERE template_id = $1 AND is_deleted = false ORDER BY sort_order, id',
                    [template.id]
                );

                templates.push({
                    ...template,
                    is_activated: isActivated,
                    items: itemsResult.rows
                });
            }

            if (templateKey && templates.length === 0) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access Denied: Template not activated or tier too low' }) };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(templateKey ? (templates[0] || null) : templates)
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

            const { id, allowed_plans, config, name, icon, template_key, base_layout, status } = payload;

            // IF NO ID, IT'S AN INSERT (CREATE NEW)
            if (!id) {
                if (!name || !template_key) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name and template_key are required for new templates' }) };
                }
                const res = await query(
                    `INSERT INTO templates (name, template_key, icon, allowed_plans, config, base_layout, status, created_at, updated_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
                    [name, template_key, icon || '🍽️', JSON.stringify(allowed_plans || []), JSON.stringify(config || {}), base_layout || 'grid', status || 'active']
                );
                return { statusCode: 201, headers, body: JSON.stringify(res.rows[0]) };
            }

            // OTHERWISE, IT'S AN UPDATE
            const targetId = parseInt(id);
            if (isNaN(targetId)) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID must be an integer' }) };
            }

            // Build update query dynamically
            const updates = [];
            const params = [];
            let paramIndex = 1;

            if (allowed_plans !== undefined) {
                updates.push(`"allowed_plans" = $${paramIndex++}::jsonb`);
                params.push(JSON.stringify(allowed_plans));
            }
            if (config !== undefined) {
                updates.push(`"config" = $${paramIndex++}::jsonb`);
                params.push(JSON.stringify(config));
            }
            if (name !== undefined) {
                updates.push(`"name" = $${paramIndex++}`);
                params.push(name);
            }
            if (icon !== undefined) {
                updates.push(`"icon" = $${paramIndex++}`);
                params.push(icon);
            }
            if (template_key !== undefined) {
                updates.push(`"template_key" = $${paramIndex++}`);
                params.push(template_key);
            }
            if (base_layout !== undefined) {
                updates.push(`"base_layout" = $${paramIndex++}`);
                params.push(base_layout);
            }
            if (status !== undefined) {
                updates.push(`"status" = $${paramIndex++}`);
                params.push(status);
            }

            if (updates.length === 0) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'No fields to update' }) };
            }

            params.push(targetId);
            const q = `UPDATE templates SET ${updates.join(', ')}, "updated_at" = NOW() WHERE "id" = $${paramIndex} RETURNING *`;
            const result = await query(q, params);

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

import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Helper to verify token
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
        // --- GET: List all menus for user (Filtered by current plan permissions) ---
        if (httpMethod === 'GET') {
            // First get latest plan from DB (token might be stale)
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

            // 1. Transaction-like: Deactivate ALL other templates for this user to ensure mutual exclusivity
            await query(
                `UPDATE restaurant_templates 
                 SET status = 'inactive' 
                 WHERE restaurant_id = $1`,
                [user.id]
            );

            // 2. Insert/Update the specific requested template to ACTIVE
            // First get the template ID from the key
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

            // 3. Create/Update the Menu Config Entry (Metadata)
            // Check if menu for this template exists
            const existingMenuRes = await query(
                'SELECT id FROM menus WHERE user_id = $1 AND template_type = $2',
                [user.id, templateType || 'custom']
            );

            let result;
            if (existingMenuRes.rows.length > 0) {
                // UPDATE
                result = await query(
                    `UPDATE menus 
                     SET name = $1, config = $2, updated_at = NOW()
                     WHERE id = $3
                     RETURNING *`,
                    [name, config, existingMenuRes.rows[0].id]
                );
            } else {
                // INSERT
                result = await query(
                    `INSERT INTO menus (user_id, name, template_type, config) 
                     VALUES ($1, $2, $3, $4) 
                     RETURNING *`,
                    [user.id, name, templateType || 'custom', config]
                );
            }

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
                [name || check.rows[0].name, config, id]
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

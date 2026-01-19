import { query } from './db.js';
import jwt from 'jsonwebtoken';

const getUserFromToken = (headers) => {
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return null;
    }
};

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const user = getUserFromToken(event.headers);
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    try {
        const data = JSON.parse(event.body);
        const {
            pos_provider,
            pos_enabled,
            pos_webhook_url,
            pos_api_key,
            stock_provider,
            stock_enabled,
            stock_sync_url,
            stock_api_key
        } = data;

        const restaurant_id = user.id;

        const result = await query(`
            INSERT INTO integration_settings (
                restaurant_id, pos_provider, pos_enabled, pos_webhook_url, pos_api_key,
                stock_provider, stock_enabled, stock_sync_url, stock_api_key, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            ON CONFLICT (restaurant_id) DO UPDATE SET
                pos_provider = EXCLUDED.pos_provider,
                pos_enabled = EXCLUDED.pos_enabled,
                pos_webhook_url = EXCLUDED.pos_webhook_url,
                pos_api_key = EXCLUDED.pos_api_key,
                stock_provider = EXCLUDED.stock_provider,
                stock_enabled = EXCLUDED.stock_enabled,
                stock_sync_url = EXCLUDED.stock_sync_url,
                stock_api_key = EXCLUDED.stock_api_key,
                updated_at = NOW()
            RETURNING *
        `, [
            restaurant_id, pos_provider, pos_enabled, pos_webhook_url, pos_api_key,
            stock_provider, stock_enabled, stock_sync_url, stock_api_key
        ]);

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0])
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

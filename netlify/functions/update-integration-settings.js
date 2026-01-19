import { query } from './db.js';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const {
            restaurant_id,
            pos_provider,
            pos_enabled,
            pos_webhook_url,
            pos_api_key,
            stock_provider,
            stock_enabled,
            stock_sync_url,
            stock_api_key
        } = data;

        if (!restaurant_id) {
            return { statusCode: 400, body: JSON.stringify({ error: "Restaurant ID required" }) };
        }

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

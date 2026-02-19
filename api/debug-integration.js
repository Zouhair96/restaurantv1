import { query } from './db.js';
import jwt from 'jsonwebtoken';

export const handler = async (event) => {
    const headers = { 'Content-Type': 'application/json' };

    try {
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader) return { statusCode: 401, headers, body: JSON.stringify({ error: "Missing token" }) };

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const userResult = await query('SELECT id, restaurant_name, role FROM users WHERE id = $1', [userId]);
        const settingsResult = await query('SELECT * FROM integration_settings WHERE restaurant_id = $1', [userId]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                user: userResult.rows[0],
                settings: settingsResult.rows[0] || "No settings found in DB",
                server_time: new Date().toISOString()
            })
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};

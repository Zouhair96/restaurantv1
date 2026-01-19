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
    const user = getUserFromToken(event.headers);
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    const restaurant_id = user.id;

    try {
        if (event.httpMethod === 'GET') {
            const result = await query(
                'SELECT * FROM integration_settings WHERE restaurant_id = $1',
                [restaurant_id]
            );

            // If settings don't exist, return defaults
            if (result.rows.length === 0) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        restaurant_id,
                        pos_provider: 'custom',
                        pos_enabled: false,
                        stock_provider: 'custom',
                        stock_enabled: false
                    })
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(result.rows[0])
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

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
                `SELECT s.*, u.stripe_onboarding_complete, u.owed_commission_balance 
                 FROM integration_settings s
                 JOIN users u ON s.restaurant_id = u.id
                 WHERE s.restaurant_id = $1`,
                [restaurant_id]
            );

            // If settings don't exist, check user table at least
            if (result.rows.length === 0) {
                const userResult = await query('SELECT stripe_onboarding_complete, owed_commission_balance FROM users WHERE id = $1', [restaurant_id]);
                const userRow = userResult.rows[0];

                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        restaurant_id,
                        pos_provider: 'custom',
                        pos_enabled: false,
                        stock_provider: 'custom',
                        stock_enabled: false,
                        stripe_onboarding_complete: userRow?.stripe_onboarding_complete || false,
                        owed_commission_balance: Number(userRow?.owed_commission_balance || 0)
                    })
                };
            }

            const settings = result.rows[0];
            return {
                statusCode: 200,
                body: JSON.stringify({
                    ...settings,
                    owed_commission_balance: Number(settings.owed_commission_balance || 0)
                })
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

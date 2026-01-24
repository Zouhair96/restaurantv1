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
            // Directly fetch from users table as integration_settings is being removed
            const userResult = await query(
                'SELECT stripe_onboarding_complete, owed_commission_balance FROM users WHERE id = $1',
                [restaurant_id]
            );

            if (userResult.rows.length === 0) {
                // Should not happen if token is valid
                return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
            }

            const userRow = userResult.rows[0];

            return {
                statusCode: 200,
                body: JSON.stringify({
                    restaurant_id,
                    stripe_onboarding_complete: userRow.stripe_onboarding_complete || false,
                    owed_commission_balance: Number(userRow.owed_commission_balance || 0),
                    // Return dummy values for frontend compatibility until frontend is fully updated
                    pos_provider: 'custom',
                    pos_enabled: false,
                    stock_provider: 'custom',
                    stock_enabled: false
                })
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

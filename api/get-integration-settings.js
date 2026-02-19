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
        return null;
    }
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const user = getUserFromToken(req.headers);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const restaurant_id = user.id;

    try {
        if (req.method === 'GET') {
            const userResult = await query(
                'SELECT stripe_onboarding_complete, owed_commission_balance FROM users WHERE id = $1',
                [restaurant_id]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userRow = userResult.rows[0];

            return res.status(200).json({
                restaurant_id,
                stripe_onboarding_complete: userRow.stripe_onboarding_complete || false,
                owed_commission_balance: Number(userRow.owed_commission_balance || 0),
                pos_provider: 'custom',
                pos_enabled: false,
                stock_provider: 'custom',
                stock_enabled: false
            });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error('Integration Settings Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

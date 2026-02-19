import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });

        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;

        const userResult = await query('SELECT subscription_end_date FROM users WHERE id = $1', [userId]);
        const dbUser = userResult.rows[0];

        if (dbUser?.subscription_end_date) {
            const endDate = new Date(dbUser.subscription_end_date);
            if (new Date() < endDate) {
                return res.status(403).json({
                    error: "Vous ne pouvez pas résilier votre abonnement avant la fin de votre période d'engagement.",
                    engagementEndDate: dbUser.subscription_end_date
                });
            }
        }

        const result = await query(
            `UPDATE users 
             SET subscription_plan = NULL, 
             subscription_status = 'inactive', 
             subscription_start_date = NULL,
             subscription_end_date = NULL
             WHERE id = $1
             RETURNING id, name, email, restaurant_name, subscription_plan, subscription_status`,
            [userId]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ message: 'Unsubscription successful', user: result.rows[0] });

    } catch (error) {
        console.error('Unsubscription Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

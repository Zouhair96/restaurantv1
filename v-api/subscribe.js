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
        const { plan } = req.body;

        const planName = typeof plan === 'object' ? plan.name : plan;
        if (!planName) return res.status(400).json({ error: 'Plan details required' });

        const PLAN_RANKS = { 'Starter': 1, 'Pro': 2, 'Enterprise': 3 };
        const userResult = await query('SELECT subscription_plan, subscription_end_date FROM users WHERE id = $1', [userId]);
        const currentUser = userResult.rows[0];

        const oldPlanRank = PLAN_RANKS[currentUser?.subscription_plan] || 0;
        const newPlanRank = PLAN_RANKS[planName] || 0;

        let newEndDate;
        if (newPlanRank < oldPlanRank) {
            newEndDate = new Date();
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        } else {
            newEndDate = currentUser?.subscription_end_date ? new Date(currentUser.subscription_end_date) : new Date();
            if (!currentUser?.subscription_end_date) newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        }

        const updateResult = await query(
            `UPDATE users 
             SET subscription_plan = $1, 
             subscription_status = 'active', 
             subscription_start_date = COALESCE(subscription_start_date, NOW()),
             subscription_end_date = $3
             WHERE id = $2
             RETURNING id, name, email, restaurant_name, subscription_plan, subscription_status, subscription_end_date`,
            [planName, userId, newEndDate]
        );

        if (updateResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ message: 'Subscription successful', user: updateResult.rows[0] });

    } catch (error) {
        console.error('Subscription Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

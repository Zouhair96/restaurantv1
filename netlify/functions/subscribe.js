import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

export const handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // 1. Verify Token
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Unauthorized: Missing token' })
            };
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET missing");
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;

        // 2. Extract Data
        const { plan, paymentMethod } = JSON.parse(event.body);

        // Handle if plan is an object (new way) or string (old way)
        const planName = typeof plan === 'object' ? plan.name : plan;

        if (!plan) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Plan details required' })
            };
        }

        // 3. Define Plan Ranks
        const PLAN_RANKS = {
            'Starter': 1,
            'Pro': 2,
            'Enterprise': 3
        };

        // 4. Fetch Current User Data
        const userQuery = 'SELECT subscription_plan, subscription_end_date FROM users WHERE id = $1';
        const userResult = await query(userQuery, [userId]);
        const currentUser = userResult.rows[0];

        const oldPlanRank = PLAN_RANKS[currentUser?.subscription_plan] || 0;
        const newPlanRank = PLAN_RANKS[planName] || 0;

        let newEndDate;

        // 5. Calculate New Engagement End Date
        if (newPlanRank < oldPlanRank) {
            // Downgrade: Reset engagement to 12 months from now
            newEndDate = new Date();
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        } else {
            // Upgrade or Same Rank (or first time): Preserve existing end date 
            // If no end date exists, set to 12 months from now
            newEndDate = currentUser?.subscription_end_date
                ? new Date(currentUser.subscription_end_date)
                : new Date();

            if (!currentUser?.subscription_end_date) {
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            }
        }

        // 6. Update Database
        const updateQuery = `
            UPDATE users 
            SET subscription_plan = $1, 
            subscription_status = 'active', 
            subscription_start_date = CASE WHEN $3 < $4 THEN NOW() ELSE subscription_start_date END,
            subscription_end_date = $5
            WHERE id = $2
            RETURNING id, name, email, restaurant_name, subscription_plan, subscription_status, subscription_end_date
        `;

        const result = await query(updateQuery, [planName, userId, newPlanRank, oldPlanRank, newEndDate]);

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'User not found' })
            };
        }

        const updatedUser = result.rows[0];

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Subscription successful',
                user: updatedUser
            }),
        };

    } catch (error) {
        console.error('Subscription Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal Server Error'
            })
        };
    }
};

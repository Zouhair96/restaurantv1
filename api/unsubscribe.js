import { query } from './db.js';
import jwt from 'jsonwebtoken';

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

        // 2. Check Engagement Period
        const userQuery = 'SELECT subscription_end_date FROM users WHERE id = $1';
        const userResult = await query(userQuery, [userId]);
        const dbUser = userResult.rows[0];

        if (dbUser?.subscription_end_date) {
            const endDate = new Date(dbUser.subscription_end_date);
            const now = new Date();

            if (now < endDate) {
                return {
                    statusCode: 403,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: "Vous ne pouvez pas résilier votre abonnement avant la fin de votre période d'engagement.",
                        engagementEndDate: dbUser.subscription_end_date
                    })
                };
            }
        }

        // 3. Update Database
        // We set subscription fields to null/inactive
        const updateQuery = `
            UPDATE users 
            SET subscription_plan = NULL, 
            subscription_status = 'inactive', 
            subscription_start_date = NULL,
            subscription_end_date = NULL
            WHERE id = $1
            RETURNING id, name, email, restaurant_name, subscription_plan, subscription_status
        `;

        const result = await query(updateQuery, [userId]);

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
                message: 'Unsubscription successful',
                user: updatedUser
            }),
        };

    } catch (error) {
        console.error('Unsubscription Error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal Server Error'
            })
        };
    }
};

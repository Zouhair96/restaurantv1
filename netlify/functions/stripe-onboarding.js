import { query } from './db.js';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    // Authenticate user
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const token = authHeader.split(' ')[1];
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (err) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token' }) };
    }

    try {
        // Get user from DB
        const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
        }

        let stripeAccountId = user.stripe_account_id;

        // If no stripe account, create one
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: 'standard', // Standard allows them to link existing accounts easily
                email: user.email,
                business_type: 'individual',
                metadata: { userId: userId.toString() }
            });
            stripeAccountId = account.id;

            await query('UPDATE users SET stripe_account_id = $1 WHERE id = $2', [stripeAccountId, userId]);
        }

        // Create account link
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.URL || 'http://localhost:8888'}/dashboard/integrations?stripe=refresh`,
            return_url: `${process.env.URL || 'http://localhost:8888'}/dashboard/integrations?stripe=success`,
            type: 'account_onboarding',
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ url: accountLink.url })
        };

    } catch (error) {
        console.error('Stripe Onboarding Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};

import { query } from './db.js';
import { getStripe } from './utils/stripe-client.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    // Standard headers for CORS and JSON
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // 1. Authenticate the restaurant owner
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const restaurantId = decoded.id;

        const stripe = await getStripe();

        // 2. Find or Create Stripe Customer for this restaurant
        const userRes = await query('SELECT email, stripe_customer_id FROM users WHERE id = $1', [restaurantId]);
        if (userRes.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'User not found' })
            };
        }

        let stripeCustomerId = userRes.rows[0].stripe_customer_id;

        if (!stripeCustomerId) {
            console.log(`[STRIPE-SETUP] Creating new Stripe customer for restaurant ${restaurantId}`);
            const customer = await stripe.customers.create({
                email: userRes.rows[0].email,
                metadata: { restaurantId: restaurantId.toString(), type: 'platform_billing' }
            });
            stripeCustomerId = customer.id;
            await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [stripeCustomerId, restaurantId]);
        }

        // 3. Create SetupIntent
        // This will be used on the frontend by Stripe Elements to securely collect card info
        const setupIntent = await stripe.setupIntents.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            usage: 'off_session',
            metadata: {
                restaurantId: restaurantId.toString(),
                purpose: 'weekly_commissions'
            }
        });

        console.log(`[STRIPE-SETUP] Created SetupIntent ${setupIntent.id} for customer ${stripeCustomerId}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                clientSecret: setupIntent.client_secret,
                customerId: stripeCustomerId
            })
        };

    } catch (error) {
        console.error(' [STRIPE-SETUP-INTENT ERROR] ', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to create SetupIntent',
                details: error.message
            })
        };
    }
};

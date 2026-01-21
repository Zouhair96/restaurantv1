import { query } from './db.js';
import jwt from 'jsonwebtoken';
import { getStripe } from './utils/stripe-client.js';

export const handler = async (event, context) => {
    console.log(' [STRIPE-ONBOARDING] Request received');
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const stripe = await getStripe();

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

        // Get user from DB
        const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
        }

        let stripeAccountId = user.stripe_account_id;

        // If no stripe account, create one
        if (!stripeAccountId) {
            console.log(' [STRIPE-ONBOARDING] No account ID found for user, creating new account...');
            const account = await stripe.accounts.create({
                type: 'standard',
                email: user.email,
                business_type: 'individual',
                metadata: { userId: userId.toString() }
            });
            stripeAccountId = account.id;
            console.log(' [STRIPE-ONBOARDING] Created new Stripe account:', stripeAccountId);

            await query('UPDATE users SET stripe_account_id = $1 WHERE id = $2', [stripeAccountId, userId]);
        }

        console.log(' [STRIPE-ONBOARDING] Creating account link for:', stripeAccountId);
        // Create account link
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.URL || 'http://localhost:8888'}/dashboard/integrations?stripe=refresh`,
            return_url: `${process.env.URL || 'http://localhost:8888'}/dashboard/integrations?stripe=success`,
            type: 'account_onboarding',
        });

        console.log(' [STRIPE-ONBOARDING] Successfully created account link:', accountLink.url);

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

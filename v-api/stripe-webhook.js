import { query } from './db.js';
import { getStripe } from './utils/stripe-client.js';

export const config = {
    api: {
        bodyParser: false,
    },
};

const getRawBody = async (readable) => {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, stripe-signature');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const stripe = await getStripe();
        const sig = req.headers['stripe-signature'];
        const rawBody = await getRawBody(req);

        // Try to get webhook secret
        let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            const result = await query('SELECT value FROM platform_settings WHERE key = $1', ['stripe_webhook_secret']);
            if (result.rows.length > 0) {
                const { decrypt } = await import('./utils/encryption.js');
                const rawSecret = result.rows[0].value.secret_key;
                if (result.rows[0].value.is_encrypted || (rawSecret && rawSecret.includes(':'))) {
                    webhookSecret = decrypt(rawSecret);
                } else {
                    webhookSecret = rawSecret;
                }
            }
        }

        let stripeEvent;
        try {
            stripeEvent = stripe.webhooks.constructEvent(
                rawBody,
                sig,
                webhookSecret
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        if (stripeEvent.type === 'checkout.session.completed') {
            const session = stripeEvent.data.object;
            const orderId = session.metadata.orderId;

            console.log(`💰 Payment confirmed for order ${orderId}`);

            const updateResult = await query(
                `UPDATE orders o 
                 SET payment_status = $1, stripe_payment_intent_id = $2 
                 WHERE o.id = $3 
                 RETURNING o.*, (SELECT restaurant_name FROM users WHERE id = o.restaurant_id) as restaurant_name`,
                ['paid', session.payment_intent, orderId]
            );

            const order = updateResult.rows[0];
            if (order) {
                // POS Sync logic (disabled as per original)
            }
        } else if (stripeEvent.type === 'setup_intent.succeeded') {
            const setupIntent = stripeEvent.data.object;
            const restaurantId = setupIntent.metadata.restaurantId;
            const paymentMethodId = setupIntent.payment_method;

            if (restaurantId && paymentMethodId) {
                await query('UPDATE users SET stripe_payment_method_id = $1 WHERE id = $2', [paymentMethodId, restaurantId]);
            }
        } else if (stripeEvent.type === 'account.updated') {
            const account = stripeEvent.data.object;
            if (account.details_submitted) {
                await query('UPDATE users SET stripe_onboarding_complete = true WHERE stripe_account_id = $1', [account.id]);
            }
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Stripe Webhook Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

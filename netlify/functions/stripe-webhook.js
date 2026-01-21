import { query } from './db.js';
import { POSManager } from './pos-adapters/pos-manager.js';
import { getStripe } from './utils/stripe-client.js';

export const handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    try {
        const stripe = await getStripe();
        const sig = event.headers['stripe-signature'];

        // Try to get webhook secret from DB first, then env
        let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            const result = await query('SELECT value FROM platform_settings WHERE key = $1', ['stripe_webhook_secret']);
            if (result.rows.length > 0) {
                const { decrypt } = await import('./utils/encryption.js');
                const rawSecret = result.rows[0].value.secret_key;

                // Use same robust decryption logic
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
                event.body,
                sig,
                webhookSecret
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return { statusCode: 400, headers, body: `Webhook Error: ${err.message}` };
        }

        // Handle the event
        if (stripeEvent.type === 'checkout.session.completed') {
            const session = stripeEvent.data.object;
            const orderId = session.metadata.orderId;

            console.log(`💰 Payment confirmed for order ${orderId}`);

            // 1. Update order status
            const updateResult = await query(
                'UPDATE orders SET payment_status = $1, stripe_payment_intent_id = $2 WHERE id = $3 RETURNING *',
                ['paid', session.payment_intent, orderId]
            );

            const order = updateResult.rows[0];

            if (order) {
                // 2. Trigger POS Sync
                const restaurantId = order.restaurant_id;
                const settingsResult = await query(
                    'SELECT * FROM integration_settings WHERE restaurant_id = $1',
                    [restaurantId]
                );

                if (settingsResult.rows.length > 0) {
                    const settings = settingsResult.rows[0];
                    if (settings.pos_enabled) {
                        const posStatus = await POSManager.sendOrder(settings, order);

                        if (posStatus.success && posStatus.external_id) {
                            await query(
                                'UPDATE orders SET external_id = $1 WHERE id = $2',
                                [posStatus.external_id, orderId]
                            );
                        }
                    }
                }
            }
        } else if (stripeEvent.type === 'account.updated') {
            const account = stripeEvent.data.object;
            if (account.details_submitted) {
                await query(
                    'UPDATE users SET stripe_onboarding_complete = true WHERE stripe_account_id = $1',
                    [account.id]
                );
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ received: true })
        };

    } catch (error) {
        console.error('Stripe Webhook Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};

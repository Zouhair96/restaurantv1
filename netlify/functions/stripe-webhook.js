import { query } from './db.js';
import { POSManager } from './pos-adapters/pos-manager.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sig = event.headers['stripe-signature'];
    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    // Handle the event
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        const orderId = session.metadata.orderId;

        console.log(`💰 Payment confirmed for order ${orderId}`);

        try {
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
        } catch (dbError) {
            console.error('Error updating order after payment:', dbError);
            return { statusCode: 500, body: 'Database Error' };
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
        body: JSON.stringify({ received: true })
    };
};

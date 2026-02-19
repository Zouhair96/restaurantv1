import { query } from './db.js';
import { getStripe } from './utils/stripe-client.js';

export default async function handler(req, res) {
    // Note: Vercel cron jobs call a standard handler. 
    // We should probably protect this with a secret header if called via cron.

    console.log('[AUTO-BILLING] Starting weekly commission processing...');

    try {
        const stripe = await getStripe();

        const restaurantsResult = await query(
            `SELECT id, email, restaurant_name, owed_commission_balance, stripe_customer_id, stripe_payment_method_id 
             FROM users 
             WHERE stripe_payment_method_id IS NOT NULL AND owed_commission_balance > 0`
        );

        if (restaurantsResult.rows.length === 0) {
            console.log('[AUTO-BILLING] No restaurants found with pending balances.');
            return res.status(200).send('No billing required.');
        }

        for (const restaurant of restaurantsResult.rows) {
            const amountInCents = Math.round(parseFloat(restaurant.owed_commission_balance) * 100);

            if (amountInCents < 50) continue;

            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amountInCents,
                    currency: 'eur',
                    customer: restaurant.stripe_customer_id,
                    payment_method: restaurant.stripe_payment_method_id,
                    off_session: true,
                    confirm: true,
                    description: `Weekly Platform Commission - ${restaurant.restaurant_name}`,
                    metadata: { restaurantId: restaurant.id.toString(), type: 'commission_billing' }
                });

                if (paymentIntent.status === 'succeeded') {
                    await query('UPDATE users SET owed_commission_balance = 0 WHERE id = $1', [restaurant.id]);
                }
            } catch (err) {
                console.error(`[AUTO-BILLING] Failed to charge restaurant ${restaurant.id}:`, err.message);
            }
        }

        return res.status(200).send('Auto-billing cycle complete.');

    } catch (error) {
        console.error('Auto-billing Error:', error);
        return res.status(500).send(error.message);
    }
}

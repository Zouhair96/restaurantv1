import { query } from './db.js';
import { getStripe } from './utils/stripe-client.js';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    // Note: Netlify scheduled functions don't usually return a body to a user,
    // they are triggered internally. But we can log everything.

    console.log('[AUTO-BILLING] Starting weekly commission processing...');

    try {
        const stripe = await getStripe();

        // 1. Find all restaurants with a saved payment method and an owed balance > 0
        const restaurantsResult = await query(
            `SELECT id, email, restaurant_name, owed_commission_balance, stripe_customer_id, stripe_payment_method_id 
             FROM users 
             WHERE stripe_payment_method_id IS NOT NULL AND owed_commission_balance > 0`
        );

        if (restaurantsResult.rows.length === 0) {
            console.log('[AUTO-BILLING] No restaurants found with pending balances and saved cards.');
            return { statusCode: 200, body: 'No billing required.' };
        }

        console.log(`[AUTO-BILLING] Found ${restaurantsResult.rows.length} restaurants to bill.`);

        for (const restaurant of restaurantsResult.rows) {
            const amountInCents = Math.round(parseFloat(restaurant.owed_commission_balance) * 100);

            // Minimum Stripe charge is usually 0.50 units (e.g. 50 cents)
            if (amountInCents < 50) {
                console.log(`[AUTO-BILLING] Skipping restaurant ${restaurant.id} - Balance too low ($${restaurant.owed_commission_balance})`);
                continue;
            }

            try {
                console.log(`[AUTO-BILLING] Attempting to charge restaurant ${restaurant.id} ($${restaurant.owed_commission_balance})...`);

                // 2. Attempt Off-Session Payment
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amountInCents,
                    currency: 'eur', // Or get from platform settings
                    customer: restaurant.stripe_customer_id,
                    payment_method: restaurant.stripe_payment_method_id,
                    off_session: true,
                    confirm: true,
                    description: `Weekly Platform Commission - ${restaurant.restaurant_name}`,
                    metadata: {
                        restaurantId: restaurant.id.toString(),
                        type: 'commission_billing'
                    }
                });

                if (paymentIntent.status === 'succeeded') {
                    console.log(`[AUTO-BILLING] ✅ Successfully charged restaurant ${restaurant.id} (PI: ${paymentIntent.id})`);

                    // 3. Reset owed balance
                    await query(
                        'UPDATE users SET owed_commission_balance = 0 WHERE id = $1',
                        [restaurant.id]
                    );
                } else {
                    console.warn(`[AUTO-BILLING] ⚠️ Charge status for restaurant ${restaurant.id} is ${paymentIntent.status}`);
                }

            } catch (err) {
                console.error(`[AUTO-BILLING] ❌ Failed to charge restaurant ${restaurant.id}:`, err.message);
                // Here you would typically notify the admin or mark the restaurant's account as "At Risk"
            }
        }

        return { statusCode: 200, body: 'Auto-billing cycle complete.' };

    } catch (globalError) {
        console.error('[AUTO-BILLING GLOBAL ERROR]', globalError);
        return { statusCode: 500, body: globalError.message };
    }
};

// Netlify Scheduled Function Config (Weekly on Mondays at 08:00)
// For actual Netlify production, this needs to be in netlify.toml or named properly
// For this environment, we'll just keep the logic here.
export const config = {
    schedule: "0 8 * * 1"
};

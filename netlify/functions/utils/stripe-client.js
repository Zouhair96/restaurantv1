import Stripe from 'stripe';
import { query } from '../db.js';
import { decrypt } from './encryption.js';

let stripeInstance = null;

export async function getStripe() {
    // If already initialized, return it
    if (stripeInstance) return stripeInstance;

    // 1. Try environment variable
    let apiKey = process.env.STRIPE_SECRET_KEY;

    // 2. If not in env, try database
    if (!apiKey) {
        try {
            const result = await query('SELECT value FROM platform_settings WHERE key = $1', ['stripe_secret_key']);
            if (result.rows.length > 0) {
                const setting = result.rows[0].value;
                const rawKey = setting.secret_key;

                // Robust decryption check: encrypted keys usually contain ':'
                if (setting.is_encrypted || (rawKey && rawKey.includes(':'))) {
                    apiKey = decrypt(rawKey);
                } else {
                    apiKey = rawKey;
                }
            }
        } catch (err) {
            console.error(' [STRIPE-CLIENT] Error fetching key from DB:', err);
        }
    }

    if (!apiKey) {
        throw new Error('Stripe API Key not found in Environment or Database. Please configure it in the Admin Dashboard.');
    }

    // Always use a fixed version for stability
    stripeInstance = new Stripe(apiKey, {
        apiVersion: '2023-10-16'
    });

    return stripeInstance;
}

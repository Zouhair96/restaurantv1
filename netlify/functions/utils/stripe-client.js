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
                if (setting.is_encrypted) {
                    apiKey = decrypt(setting.secret_key);
                } else {
                    apiKey = setting.secret_key;
                }
            }
        } catch (err) {
            console.error('Error fetching Stripe key from DB:', err);
        }
    }

    if (!apiKey) {
        throw new Error('Stripe API Key not found in Environment or Database');
    }

    stripeInstance = new Stripe(apiKey);
    return stripeInstance;
}

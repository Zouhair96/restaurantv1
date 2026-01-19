import { query } from '../db.js';
import bcrypt from 'bcryptjs';

export async function validateApiKey(apiKey) {
    if (!apiKey) return null;

    // Search for all keys (in a larger system, we'd use a prefix to find the restaurant first)
    const result = await query('SELECT restaurant_id, key_hash FROM restaurant_api_keys');

    for (const row of result.rows) {
        const match = await bcrypt.compare(apiKey, row.key_hash);
        if (match) {
            // Update last_used
            await query('UPDATE restaurant_api_keys SET last_used = NOW() WHERE key_hash = $1', [row.key_hash]);
            return row.restaurant_id;
        }
    }

    return null;
}

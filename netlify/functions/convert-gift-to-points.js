import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    try {
        const { giftId, loyaltyId, restaurantId } = JSON.parse(event.body);

        if (!giftId || !loyaltyId || !restaurantId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        // 1. Fetch Restaurant Config
        const configRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
        const config = configRes.rows[0]?.loyalty_config || {};

        if (!config.gift_conversion_enabled) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Gift conversion is disabled for this restaurant' }) };
        }

        const pointsPerEuro = config.points_per_euro || 100;

        await query('BEGIN');
        try {
            // 2. Fetch & Lock Gift
            const giftRes = await query('SELECT * FROM gifts WHERE id = $1 AND device_id = $2 AND restaurant_id = $3 FOR UPDATE', [giftId, loyaltyId, restaurantId]);
            const gift = giftRes.rows[0];

            if (!gift) {
                await query('ROLLBACK');
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Gift not found' }) };
            }

            if (gift.status !== 'unused') {
                await query('ROLLBACK');
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Gift has already been used or converted' }) };
            }

            // 3. Calculate Points
            const conversionPoints = Math.floor(parseFloat(gift.euro_value) * pointsPerEuro);

            // 4. Mark Gift as Consumed
            await query('UPDATE gifts SET status = \'consumed\' WHERE id = $1', [giftId]);

            // 5. Log Point Transaction
            await query(`
                INSERT INTO points_transactions (restaurant_id, device_id, type, amount, created_at)
                VALUES ($1, $2, 'CONVERT_GIFT', $3, NOW())
            `, [restaurantId, loyaltyId, conversionPoints]);

            // 6. Update Visitor Balance
            await query(`
                UPDATE loyalty_visitors 
                SET total_points = COALESCE(total_points, 0) + $1 
                WHERE restaurant_id = $2 AND device_id = $3
            `, [conversionPoints, restaurantId, loyaltyId]);

            await query('COMMIT');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    convertedPoints: conversionPoints,
                    message: `Successfully converted gift to ${conversionPoints} points`
                })
            };

        } catch (err) {
            await query('ROLLBACK').catch(() => { });
            throw err;
        }

    } catch (error) {
        console.error('Gift conversion error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};

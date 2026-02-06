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
        const body = JSON.parse(event.body);
        const { giftId, loyaltyId, restaurantId } = body;

        if (!giftId || !loyaltyId || !restaurantId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        await query('BEGIN');
        try {
            // 1. SELECT FOR UPDATE - Lock the gift row and ensure it is UNUSED
            const giftRes = await query(`
                SELECT * FROM gifts 
                WHERE id = $1 AND device_id = $2 AND restaurant_id = $3 
                FOR UPDATE
            `, [giftId, loyaltyId, restaurantId]);

            const gift = giftRes.rows[0];

            if (!gift) {
                await query('ROLLBACK');
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Gift not found' }) };
            }

            if (gift.status !== 'unused') {
                await query('ROLLBACK');
                return { statusCode: 400, headers, body: JSON.stringify({ error: `Gift cannot be converted (Current status: ${gift.status})` }) };
            }

            // 2. Determine points value
            const userRes = await query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
            const config = userRes.rows[0]?.loyalty_config || {};
            const ppe = parseInt(config.points_per_euro) || 100; // Default to 100 if not set

            let conversionPoints = 0;

            if (gift.type === 'PERCENTAGE') {
                if (!gift.order_id) {
                    await query('ROLLBACK');
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Percentage gift must be linked to an order for conversion' }) };
                }
                const orderRes = await query('SELECT total_price FROM orders WHERE id = $1', [gift.order_id]);
                const orderTotal = parseFloat(orderRes.rows[0]?.total_price || 0);
                const perc = parseFloat(gift.percentage_value || 0);
                conversionPoints = Math.floor((orderTotal * perc / 100) * ppe);
            } else {
                // FIXED_VALUE
                const value = parseFloat(gift.euro_value || 0);
                conversionPoints = Math.floor(value * ppe);
            }

            if (conversionPoints <= 0) {
                await query('ROLLBACK');
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Conversion resulted in 0 points' }) };
            }

            // 3. Log Points Transaction (UNIQUE constraint on gift_id prevents duplicates)
            await query(`
                INSERT INTO points_transactions (restaurant_id, device_id, type, amount, gift_id, created_at)
                VALUES ($1, $2, 'CONVERT_GIFT', $3, $4, NOW())
            `, [restaurantId, loyaltyId, conversionPoints, giftId]);

            // 4. Update Cached Balance
            await query(`
                UPDATE loyalty_visitors 
                SET total_points = COALESCE(total_points, 0) + $1 
                WHERE restaurant_id = $2 AND device_id = $3
            `, [conversionPoints, restaurantId, loyaltyId]);

            // 5. Finalize Gift Lifecycle
            await query('UPDATE gifts SET status = \'converted\' WHERE id = $1', [giftId]);

            await query('COMMIT');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    addedPoints: conversionPoints,
                    message: `Successfully converted reward to ${conversionPoints} points`
                })
            };

        } catch (txErr) {
            await query('ROLLBACK').catch(() => { });
            throw txErr;
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

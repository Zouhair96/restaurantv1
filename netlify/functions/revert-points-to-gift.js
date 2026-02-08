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
            // 1. SELECT FOR UPDATE - Lock the gift row and ensure it is 'converted'
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

            if (gift.status !== 'converted') {
                await query('ROLLBACK');
                return { statusCode: 400, headers, body: JSON.stringify({ error: `Gift status is ${gift.status}, cannot revert.` }) };
            }

            // 2. Find the points transaction associated with this gift
            const txRes = await query(`
                SELECT * FROM points_transactions 
                WHERE gift_id = $1 AND device_id = $2 AND restaurant_id = $3 AND type = 'CONVERT_GIFT'
            `, [giftId, loyaltyId, restaurantId]);

            const transaction = txRes.rows[0];
            if (!transaction) {
                await query('ROLLBACK');
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Conversion transaction not found' }) };
            }

            const pointsAmount = transaction.amount;

            // 3. Subtract points from loyalty balance
            await query(`
                UPDATE loyalty_visitors 
                SET total_points = GREATEST(0, COALESCE(total_points, 0) - $1) 
                WHERE restaurant_id = $2 AND device_id = $3
            `, [pointsAmount, restaurantId, loyaltyId]);

            // 4. Delete the points transaction
            await query('DELETE FROM points_transactions WHERE id = $1', [transaction.id]);

            // 5. Restore gift status to 'unused'
            await query('UPDATE gifts SET status = \'unused\' WHERE id = $1', [giftId]);

            await query('COMMIT');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    revertedPoints: pointsAmount,
                    message: `Successfully reverted ${pointsAmount} points back to gift`
                })
            };

        } catch (txErr) {
            await query('ROLLBACK').catch(() => { });
            throw txErr;
        }

    } catch (error) {
        console.error('Points reversal error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};

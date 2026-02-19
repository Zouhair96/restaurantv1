import { query } from './db.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { giftId, loyaltyId, restaurantId } = req.body;

        if (!giftId || !loyaltyId || !restaurantId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await query('BEGIN');
        try {
            const giftRes = await query(`
                SELECT * FROM gifts 
                WHERE id = $1 AND device_id = $2 AND restaurant_id = $3 
                FOR UPDATE
            `, [giftId, loyaltyId, restaurantId]);

            const gift = giftRes.rows[0];

            if (!gift) {
                await query('ROLLBACK');
                return res.status(404).json({ error: 'Gift not found' });
            }

            if (gift.status !== 'converted') {
                await query('ROLLBACK');
                return res.status(400).json({ error: `Gift status is ${gift.status}, cannot revert.` });
            }

            const txRes = await query(`
                SELECT * FROM points_transactions 
                WHERE gift_id = $1 AND device_id = $2 AND restaurant_id = $3 AND type = 'CONVERT_GIFT'
            `, [giftId, loyaltyId, restaurantId]);

            const transaction = txRes.rows[0];
            if (!transaction) {
                await query('ROLLBACK');
                return res.status(404).json({ error: 'Conversion transaction not found' });
            }

            const pointsAmount = transaction.amount;

            await query(`
                UPDATE loyalty_visitors 
                SET total_points = GREATEST(0, COALESCE(total_points, 0) - $1) 
                WHERE restaurant_id = $2 AND device_id = $3
            `, [pointsAmount, restaurantId, loyaltyId]);

            await query('DELETE FROM points_transactions WHERE id = $1', [transaction.id]);
            await query('UPDATE gifts SET status = \'unused\' WHERE id = $1', [giftId]);

            await query('COMMIT');
            return res.status(200).json({ success: true, revertedPoints: pointsAmount });
        } catch (txErr) {
            await query('ROLLBACK').catch(() => { });
            throw txErr;
        }
    } catch (error) {
        console.error('Points reversal error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

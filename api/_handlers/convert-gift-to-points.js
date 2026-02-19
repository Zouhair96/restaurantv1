import { query, getClient } from './db.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { giftId, loyaltyId, restaurantId, orderTotal } = req.body;

        if (!giftId || !loyaltyId || !restaurantId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const client = await getClient();

        try {
            await client.query('BEGIN');

            const giftRes = await client.query(`
                SELECT * FROM gifts 
                WHERE id = $1 AND device_id = $2 AND restaurant_id = $3 
                FOR UPDATE
            `, [giftId, loyaltyId, restaurantId]);

            const gift = giftRes.rows[0];

            if (!gift) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Gift not found' });
            }

            if (gift.status !== 'unused') {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: `Gift cannot be converted (Status: ${gift.status})` });
            }

            const userRes = await client.query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
            const config = userRes.rows[0]?.loyalty_config || {};
            const ppe = parseInt(config.points_per_euro) || 100;

            let conversionPoints = 0;

            if (gift.type === 'PERCENTAGE') {
                let total = orderTotal || 0;
                if (!total && gift.order_id) {
                    const orderRes = await client.query('SELECT total_price FROM orders WHERE id = $1', [gift.order_id]);
                    total = parseFloat(orderRes.rows[0]?.total_price || 0);
                }
                if (!total) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: 'Order total required for percentage conversion' });
                }
                conversionPoints = Math.floor((total * parseFloat(gift.percentage_value || 0) / 100) * ppe);
            } else if (gift.type === 'ITEM') {
                let currentPrice = parseFloat(gift.euro_value || 0);
                if (gift.gift_name) {
                    try {
                        const priceRes = await client.query(`
                            SELECT price FROM (
                                SELECT DISTINCT ON (name)
                                    COALESCE(io.name_override, ti.name) as name,
                                    COALESCE(io.price_override, ti.price) as price
                                FROM restaurant_templates rt
                                JOIN templates t ON rt.template_id = t.id
                                LEFT JOIN template_items ti ON ti.template_id = t.id AND ti.is_deleted = false
                                LEFT JOIN item_overrides io ON io.template_item_id = ti.id AND io.restaurant_id = rt.restaurant_id
                                WHERE rt.restaurant_id = $1 AND rt.status = 'active'
                                UNION
                                SELECT name_override as name, price_override as price
                                FROM item_overrides
                                WHERE restaurant_id = $1 AND template_item_id IS NULL
                            ) menu_lookup WHERE name = $2
                        `, [restaurantId, gift.gift_name]);
                        if (priceRes.rows.length > 0) currentPrice = parseFloat(priceRes.rows[0].price || 0);
                    } catch (e) { console.warn('Price lookup failed'); }
                }
                conversionPoints = Math.floor(currentPrice * ppe);
            } else {
                conversionPoints = Math.floor(parseFloat(gift.euro_value || 0) * ppe);
            }

            if (conversionPoints <= 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Conversion resulted in 0 points' });
            }

            await client.query(`INSERT INTO points_transactions (restaurant_id, device_id, type, amount, gift_id, created_at) VALUES ($1, $2, 'CONVERT_GIFT', $3, $4, NOW())`, [restaurantId, loyaltyId, conversionPoints, giftId]);
            await client.query(`UPDATE loyalty_visitors SET total_points = COALESCE(total_points, 0) + $1 WHERE restaurant_id = $2 AND device_id = $3`, [conversionPoints, restaurantId, loyaltyId]);
            await client.query('UPDATE gifts SET status = \'converted\' WHERE id = $1', [giftId]);

            await client.query('COMMIT');
            return res.status(200).json({ success: true, addedPoints: conversionPoints });
        } catch (txErr) {
            await client.query('ROLLBACK').catch(() => { });
            throw txErr;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Gift conversion error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

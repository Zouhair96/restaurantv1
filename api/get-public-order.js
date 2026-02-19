import { query } from './db.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const orderId = req.query.orderId;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const result = await query(
            `SELECT id, status, total_price, created_at, updated_at, order_type, table_number, items
             FROM orders
             WHERE id = $1`,
            [orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Get Public Order Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

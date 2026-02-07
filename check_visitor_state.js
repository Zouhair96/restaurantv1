import { query } from './netlify/functions/db.js';

async function checkState() {
    try {
        const res = await query('SELECT * FROM loyalty_visitors ORDER BY last_visit_at DESC LIMIT 5');
        console.log('--- RECENT VISITORS ---');
        console.table(res.rows);

        const orders = await query('SELECT id, restaurant_id, status, loyalty_id, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
        console.log('--- RECENT ORDERS ---');
        console.table(orders.rows);
    } catch (err) {
        console.error(err);
    }
}

checkState();

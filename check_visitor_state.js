import { query } from './netlify/functions/db.js';

async function checkState() {
    try {
        const res = await query('SELECT * FROM loyalty_visitors WHERE restaurant_id = 1');
        console.log('--- ALL VISITORS (Restaurant 1) ---');
        console.table(res.rows);

        const orders = await query('SELECT id, restaurant_id, status, loyalty_id, created_at FROM orders WHERE restaurant_id = 1 ORDER BY created_at DESC LIMIT 10');
        console.log('--- RECENT ORDERS (Restaurant 1) ---');
        console.table(orders.rows);
    } catch (err) {
        console.error(err);
    }
}

checkState();

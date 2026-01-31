import { query } from '../netlify/functions/db.js';

const debugLoyalty = async () => {
    try {
        console.log('--- RECENT ORDERS ---');
        const orders = await query('SELECT id, status, loyalty_id, created_at FROM orders ORDER BY created_at DESC LIMIT 3');
        console.log(JSON.stringify(orders.rows, null, 2));

        console.log('\n--- LOYALTY VISITORS ---');
        const visitors = await query('SELECT restaurant_id, device_id, visit_count, orders_in_current_session FROM loyalty_visitors ORDER BY last_session_at DESC LIMIT 3');
        console.log(JSON.stringify(visitors.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugLoyalty();

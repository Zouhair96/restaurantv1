
import dotenv from 'dotenv';
dotenv.config();
import { query, getClient } from './netlify/functions/db.js';

async function testUpdateLogic() {
    console.log('--- 🧪 REPRODUCING LOYALTY UPDATE ---');

    // 1. Fetch Order and Visitor
    const orderRes = await query(`
        SELECT id, restaurant_id, status, loyalty_id, created_at, total_price 
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 1
    `);

    if (orderRes.rows.length === 0) return console.log('❌ No orders.');
    const order = orderRes.rows[0];
    const orderId = order.id;
    const loyaltyId = order.loyalty_id;
    const orderRestaurantId = order.restaurant_id;

    if (!loyaltyId) return console.log('❌ No loyalty ID.');

    // 2. Mock Logic (Copied from update-order-status.js)
    const client = await getClient();
    try {
        await client.query('BEGIN');

        console.log(`[Replay] Checking visitor for loyaltyId: ${loyaltyId}`);

        let visitorRes = await client.query(
            'SELECT id, visit_count, orders_in_current_session, last_visit_at FROM loyalty_visitors WHERE restaurant_id = $1 AND device_id = $2 FOR UPDATE',
            [orderRestaurantId, loyaltyId]
        );

        let visitor = visitorRes.rows[0];
        console.log(`[Replay] Visitor found: ID=${visitor ? visitor.id : 'NONE'}`);
        if (!visitor) throw new Error("Visitor not found (should have been created by submit-order)");

        // Config
        const userRes = await client.query('SELECT loyalty_config FROM users WHERE id = $1', [orderRestaurantId]);
        const config = userRes.rows[0]?.loyalty_config || {};
        console.log('[Replay] Config loaded:', JSON.stringify(config));

        // Visit Count Logic
        const prevOrderRes = await client.query(`
            SELECT created_at FROM orders 
            WHERE loyalty_id = $1 AND restaurant_id = $2 AND status = 'completed' AND id != $3
            ORDER BY created_at DESC LIMIT 1
        `, [loyaltyId, orderRestaurantId, orderId]);

        const lastVisitCompletion = prevOrderRes.rows[0]?.created_at ? new Date(prevOrderRes.rows[0].created_at) : null;
        const thisOrderCreation = new Date(order.created_at);
        const sessionTimeout = 2 * 60 * 1000;

        console.log(`[Replay] visit_count in DB: ${visitor.visit_count}`);

        const isNewVisit = true; // Force calc logic: !lastVisitCompletion || (thisOrderCreation - lastVisitCompletion > sessionTimeout) || (parseInt(visitor.visit_count || 0) === 0);
        console.log(`[Replay] isNewVisit assumed TRUE for reproduction`);

        if (isNewVisit) {
            const newVisitCount = parseInt(visitor.visit_count || 0) + 1;
            console.log(`[Replay] Will update visit_count to: ${newVisitCount}`);

            // Visit 1: Welcome Gift
            if (newVisitCount === 1) {
                // Support both old and new config structures
                const welcomeVal = parseInt(config.welcomeConfig?.value || config.welcome_discount_value) || 10;
                console.log(`[Replay] Inserting Welcome Gift with value: ${welcomeVal}`);

                await client.query(`
                    INSERT INTO gifts (restaurant_id, device_id, type, percentage_value, euro_value, status)
                    VALUES ($1, $2, 'PERCENTAGE', $3, 0.00, 'unused')
                `, [orderRestaurantId, loyaltyId, welcomeVal]);
                console.log('✅ [Replay] Gift Inserted!');
            }

            // TRY THE UPDATE QUERY
            await client.query(`
                UPDATE loyalty_visitors 
                SET visit_count = $1, orders_in_current_session = 1, last_visit_at = NOW()
                WHERE id = $2
            `, [newVisitCount, visitor.id]);

            console.log('✅ [Replay] Update successful!');
        }

        await client.query('ROLLBACK');
        console.log('✅ Transaction Rolled Back (Test Only)');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ [Replay] CAUGHT ERROR:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

testUpdateLogic();

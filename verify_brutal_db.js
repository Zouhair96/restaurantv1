
import dotenv from 'dotenv';
dotenv.config();
import { handler as submitOrder } from './netlify/functions/submit-order.js';
import { query } from './netlify/functions/db.js';

async function runTest() {
    console.log('--- 🧪 STARTING BRUTAL DB TEST ---');

    try {
        // 0. Setup
        const uRes = await query('SELECT restaurant_name FROM users WHERE restaurant_name IS NOT NULL LIMIT 1');
        const restaurantName = uRes.rows[0].restaurant_name;
        const testLoyaltyId = 'brutal_test_' + Date.now();
        console.log(`📍 Restaurant: ${restaurantName}`);
        console.log(`👤 User: ${testLoyaltyId}`);

        // 1. Submit Order
        // Using "cash" payment to trigger "pending_cash" or "pending" status (submit-order logic)
        const orderBody = {
            restaurantName,
            orderType: 'take_out',
            paymentMethod: 'cash',
            items: [{ id: 1, name: 'Brutal Pizza', price: 10, quantity: 1 }],
            totalPrice: 10,
            loyalty_id: testLoyaltyId
        };

        console.log('\n--- 1. Submitting Order (simulating Checkout.jsx) ---');
        const res = await submitOrder({
            httpMethod: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderBody)
        });

        if (res.statusCode !== 201) {
            console.error('❌ SUBMIT FAILED:', res.body);
            throw new Error('Submit failed');
        }
        console.log('✅ Order Submitted.');

        // 2. THE BRUTAL CHECK
        console.log('\n--- 2. BRUTAL DB CHECK ---');
        const dbRes = await query(`
            SELECT orders_in_current_session 
            FROM loyalty_visitors 
            WHERE device_id = $1
        `, [testLoyaltyId]);

        if (dbRes.rows.length === 0) throw new Error('Visitor record not created!');

        const count = dbRes.rows[0].orders_in_current_session;
        console.log(`📊 DB Value: orders_in_current_session = ${count}`);

        if (parseInt(count) > 0) {
            console.log('✅ PASS: Backend is incrementing correctly.');
            console.log('If UI shows wrong message, it is a Frontend state sync issue.');
        } else {
            console.error('❌ FAIL: Backend did NOT increment count.');
            console.error('submit-order.js logic is broken or bypassed.');
        }

    } catch (err) {
        console.error('❌ TEST FAILED:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runTest();

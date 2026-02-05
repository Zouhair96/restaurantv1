
import dotenv from 'dotenv';
dotenv.config();
import { handler as getStatus } from './netlify/functions/get-loyalty-status.js';
import { handler as submitOrder } from './netlify/functions/submit-order.js';
import { query } from './netlify/functions/db.js';

async function runTest() {
    console.log('--- 🧪 STARTING FULL LOYALTY SIMULATION ---');

    try {
        // 0. Setup
        const uRes = await query('SELECT restaurant_name, id FROM users WHERE restaurant_name IS NOT NULL LIMIT 1');
        const restaurantName = uRes.rows[0].restaurant_name;
        const restaurantId = uRes.rows[0].id;
        const testLoyaltyId = 'sim_user_' + Date.now();

        console.log(`📍 Restaurant: ${restaurantName} (ID: ${restaurantId})`);
        console.log(`👤 Simulated User ID: ${testLoyaltyId}`);

        // 1. Initial State (Session 1 Start)
        console.log('\n--- STEP 1: First Visit (No Orders) ---');
        const event1 = { httpMethod: 'GET', queryStringParameters: { loyaltyId: testLoyaltyId, restaurantName } };
        const res1 = await getStatus(event1);
        const body1 = JSON.parse(res1.body);
        console.log(`[UI] Orders in Session: ${body1.ordersInCurrentVisit} (Expected: 0)`);
        console.log(`[UI] Total Visits: ${body1.totalVisits} (Expected: 0)`);

        if (body1.ordersInCurrentVisit !== 0) throw new Error('Failed Step 1');

        // 2. Place Order (Session 1 Active)
        console.log('\n--- STEP 2: Placing Order... ---');
        const orderBody = {
            restaurantName, orderType: 'take_out', paymentMethod: 'cash',
            items: [{ id: 1, name: 'Pizza', price: 10, quantity: 1 }], totalPrice: 10,
            loyalty_id: testLoyaltyId // This mimics the Checkout.jsx fix
        };
        await submitOrder({ httpMethod: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderBody) });
        console.log('✅ Order Submitted.');

        // 3. Verify Immediate Update (Still Session 1, but Active)
        console.log('\n--- STEP 3: Immediate Refresh (Session 1 Active) ---');
        const res3 = await getStatus(event1);
        const body3 = JSON.parse(res3.body);
        console.log(`[UI] Orders in Session: ${body3.ordersInCurrentVisit} (Expected: 1)`);
        if (body3.ordersInCurrentVisit !== 1) throw new Error('Order not counted immediately!');
        console.log('✅ "Enjoy your visit" message would show now.');

        // 4. Time Travel (Simulating 10 minute wait)
        console.log('\n--- STEP 4: ⏳ Time Travel (Waiting 10 mins)... ---');
        await query(`
            UPDATE loyalty_visitors 
            SET last_session_at = NOW() - INTERVAL '10 minutes' 
            WHERE device_id = $1
        `, [testLoyaltyId]);
        console.log('✅ Clock forwarded.');

        // 5. Verify Session 2 (Welcome Back)
        console.log('\n--- STEP 5: Refresh after Timeout (Start Session 2) ---');
        const res5 = await getStatus(event1);
        const body5 = JSON.parse(res5.body);

        console.log(`[UI] Total Visits: ${body5.totalVisits} (Expected: 1)`);
        console.log(`[UI] Orders in Session: ${body5.ordersInCurrentVisit} (Expected: 0)`);

        if (body5.totalVisits === 1 && body5.ordersInCurrentVisit === 0) {
            console.log('🎉 SUCCESS! System correctly banked Session 1 and started Session 2.');
            console.log('✅ You would see: "🎉 Welcome back! You unlocked 10% OFF..."');
        } else {
            console.error('❌ FAILED to transition to Session 2.');
            console.error(body5);
            throw new Error('Session 2 transition failed');
        }

    } catch (err) {
        console.error('❌ TEST FAILED:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runTest();

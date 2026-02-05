
import dotenv from 'dotenv';
dotenv.config();
import { handler as getStatus } from './netlify/functions/get-loyalty-status.js';
import { query } from './netlify/functions/db.js';

async function runTest() {
    console.log('--- 🧪 GENERATING FINAL JSON PROOF ---');

    try {
        // 0. Setup
        const uRes = await query('SELECT restaurant_name, id FROM users WHERE restaurant_name IS NOT NULL LIMIT 1');
        const restaurantName = uRes.rows[0].restaurant_name;
        const restaurantId = uRes.rows[0].id;
        const testLoyaltyId = 'json_proof_' + Date.now();

        console.log(`📍 Restaurant: ${restaurantName}`);
        console.log(`👤 User: ${testLoyaltyId}`);

        // 1. Create Visitor State (Session 1, 1 Order Submitted)
        // This simulates: User came, placed order (submit-order set orders=1), order is now completed.
        console.log('\n--- 1. Setting DB State: Session 1, 1 Active Order ---');
        await query(`
            INSERT INTO loyalty_visitors (restaurant_id, device_id, visit_count, orders_in_current_session, last_session_at, total_points, last_visit_at)
            VALUES ($1, $2, 0, 1, NOW(), 10, NOW())
        `, [restaurantId, testLoyaltyId]);


        // 2. Call API (Simulating Page Reload)
        console.log('\n--- 2. Calling get-loyalty-status (Page Reload) ---');
        const event = { httpMethod: 'GET', queryStringParameters: { loyaltyId: testLoyaltyId, restaurantName } };
        const res = await getStatus(event);
        const body = JSON.parse(res.body);

        console.log('\n👇 HERE IS THE EXACT JSON RESPONSE 👇');
        console.log(JSON.stringify(body, null, 2));
        console.log('👆 --------------------------------- 👆');

        // Verification for the user's peace of mind
        if (body.hasPlacedOrderInCurrentSession === true) {
            console.log('\n✅ PROOF: hasPlacedOrderInCurrentSession is TRUE');
        } else {
            console.error('\n❌ FAILURE: Flag is FALSE');
        }

    } catch (err) {
        console.error('❌ TEST FAILED:', err);
    } finally {
        process.exit(0);
    }
}

runTest();


import dotenv from 'dotenv';
dotenv.config();
import { handler as getStatus } from './netlify/functions/get-loyalty-status.js';
import { query } from './netlify/functions/db.js';

async function runTest() {
    console.log('--- 🧪 STARTING MANDATORY FLAG VERIFICATION ---');

    try {
        // 0. Setup
        const uRes = await query('SELECT restaurant_name FROM users WHERE restaurant_name IS NOT NULL LIMIT 1');
        const restaurantName = uRes.rows[0].restaurant_name;
        const testLoyaltyId = 'flag_test_' + Date.now();

        console.log(`📍 Restaurant: ${restaurantName}`);
        console.log(`👤 User: ${testLoyaltyId}`);

        // 1. Manually Shake DB into "Session 2" state
        // visit_count = 1 (banked), orders_in_current_session = 0
        console.log('\n--- STEP 1: Forcing Session 2 State ---');
        await query(`
            INSERT INTO loyalty_visitors (restaurant_id, device_id, visit_count, orders_in_current_session, last_session_at, total_points)
            VALUES ((SELECT id FROM users WHERE restaurant_name = $1 LIMIT 1), $2, 1, 0, NOW(), 0)
        `, [restaurantName, testLoyaltyId]);
        console.log('✅ DB State Set: visit_count=1, orders=0');

        // 2. Call API
        console.log('\n--- STEP 2: Calling get-loyalty-status ---');
        const event = { httpMethod: 'GET', queryStringParameters: { loyaltyId: testLoyaltyId, restaurantName } };
        const res = await getStatus(event);
        const body = JSON.parse(res.body);

        console.log('🔍 FULL API RESPONSE:');
        console.log(JSON.stringify(body, null, 2));

        // 3. Mandatory Assertion
        console.log('\n--- STEP 3: Verifying Flags ---');
        if (body.isWelcomeDiscountEligible === true) {
            console.log('✅ PASS: isWelcomeDiscountEligible is TRUE');
        } else {
            console.error('❌ FAIL: isWelcomeDiscountEligible is ' + body.isWelcomeDiscountEligible);
            throw new Error('Flag check failed');
        }

        if (body.hasPlacedOrderInCurrentSession === false) {
            console.log('✅ PASS: hasPlacedOrderInCurrentSession is FALSE');
        } else {
            console.error('❌ FAIL: hasPlacedOrderInCurrentSession is ' + body.hasPlacedOrderInCurrentSession);
            throw new Error('Flag check failed');
        }

    } catch (err) {
        console.error('❌ TEST FAILED:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runTest();

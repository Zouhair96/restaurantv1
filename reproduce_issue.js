
import dotenv from 'dotenv';
dotenv.config();
import { query } from './netlify/functions/db.js';

async function verifySessionFlow() {
    const testLoyaltyId = 'test-visitor-' + Date.now();

    // Get valid restaurant
    const restaurantName = 'foody';

    console.log(`--- 🧪 VERIFYING SESSION FLOW FOR: ${testLoyaltyId} (Rest: ${restaurantName}) ---`);

    try {
        // 1. Initial Status (Session 1, Visit 0)
        console.log('\n[Step 1] Checking initial status...');
        const res1 = await fetchStatus(testLoyaltyId, restaurantName);
        console.log(`UI State: ${res1.uiState}`);
        console.log(`Orders in current visit: ${res1.ordersInCurrentVisit}`);

        if (res1.uiState === 'WELCOME' && res1.ordersInCurrentVisit === 0) {
            console.log('✅ PASS: Initial state is WELCOME');
        } else {
            console.error('❌ FAIL: Expected WELCOME state');
        }

        // 2. Place Order
        console.log('\n[Step 2] Placing order...');
        const orderRes = await submitOrder(testLoyaltyId, restaurantName);
        console.log(`Order ID: ${orderRes.orderId}`);

        // 3. Verify status after order (Should be WELCOME with ordersInCurrentVisit > 0)
        console.log('\n[Step 3] Checking status after order...');
        const res2 = await fetchStatus(testLoyaltyId, restaurantName);
        console.log(`UI State: ${res2.uiState}`);
        console.log(`Orders in current visit: ${res2.ordersInCurrentVisit}`);
        console.log(`Visit Count: ${res2.totalVisits}`);

        if (res2.uiState === 'WELCOME' && res2.ordersInCurrentVisit > 0 && res2.totalVisits === 0) {
            console.log('✅ PASS: Session 1 persisted with order recorded');
            console.log('   (In frontend, this combination triggers "Profitez de votre visite...")');
        } else {
            console.error('❌ FAIL: Status discrepancy after order');
        }

        // 4. Wait for 1 minute (mocking by updating DB directly for speed)
        console.log('\n[Step 4] Simulating session timeout (1 minute)...');
        await query('UPDATE loyalty_visitors SET last_visit_at = NOW() - INTERVAL \'2 minutes\' WHERE device_id = $1', [testLoyaltyId]);

        // 5. Verify status after timeout (Should reset ordersInCurrentVisit)
        console.log('\n[Step 5] Checking status after timeout...');
        const res3 = await fetchStatus(testLoyaltyId, restaurantName);
        console.log(`Orders in current visit: ${res3.ordersInCurrentVisit}`);

        if (res3.ordersInCurrentVisit === 0) {
            console.log('✅ PASS: Session timed out correctly');
        } else {
            console.error('❌ FAIL: Session did not timeout');
        }

    } catch (err) {
        console.error('❌ ERROR:', err);
    } finally {
        // Clean up test data to keep DB clean
        await query('DELETE FROM orders WHERE loyalty_id = $1', [testLoyaltyId]);
        await query('DELETE FROM loyalty_visitors WHERE device_id = $1', [testLoyaltyId]);
        process.exit(0);
    }
}

async function fetchStatus(loyaltyId, restaurantName) {
    const { handler } = await import('./netlify/functions/get-loyalty-status.js');
    const event = {
        httpMethod: 'GET',
        queryStringParameters: { loyaltyId, restaurantName },
        headers: {}
    };
    const response = await handler(event);
    return JSON.parse(response.body);
}

async function submitOrder(loyaltyId, restaurantName) {
    const { handler } = await import('./netlify/functions/submit-order.js');
    const event = {
        httpMethod: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            restaurantName,
            orderType: 'take_out',
            paymentMethod: 'cash',
            items: [{ id: 1, name: 'Test Pizza', price: 10, quantity: 1 }],
            totalPrice: 10,
            loyalty_id: loyaltyId
        })
    };
    const response = await handler(event);
    return JSON.parse(response.body);
}

verifySessionFlow();

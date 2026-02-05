
import dotenv from 'dotenv';
dotenv.config();
import { handler as getStatus } from './netlify/functions/get-loyalty-status.js';
import { handler as submitOrder } from './netlify/functions/submit-order.js';
import { query } from './netlify/functions/db.js';

async function runTest() {
    console.log('--- STARTING LOYALTY REPRODUCTION TEST (ROBUST) ---');

    try {
        // 0. Get Valid Restaurant
        const uRes = await query('SELECT restaurant_name FROM users WHERE restaurant_name IS NOT NULL LIMIT 1');
        if (uRes.rows.length === 0) throw new Error('No users found in DB');
        const restaurantName = uRes.rows[0].restaurant_name;
        console.log(`Using Restaurant: "${restaurantName}"`);

        const testLoyaltyId = 'test_user_' + Date.now();
        console.log(`Test Loyalty ID: ${testLoyaltyId}`);

        // 1. Initial Status Check
        console.log('\n1. Checking Initial Status...');
        const event1 = {
            httpMethod: 'GET',
            queryStringParameters: {
                loyaltyId: testLoyaltyId,
                restaurantName: restaurantName
            }
        };
        const res1 = await getStatus(event1);
        const body1 = JSON.parse(res1.body);

        if (res1.statusCode !== 200) {
            console.error('❌ GET FAILED:', body1);
            throw new Error('Get status failed');
        }

        console.log('Initial Status:', {
            totalVisits: body1.totalVisits,
            ordersInCurrentVisit: body1.ordersInCurrentVisit,
            sessionIsValid: body1.sessionIsValid
        });

        if (body1.ordersInCurrentVisit !== 0) throw new Error('Expected 0 orders initially');

        // 2. Submit Order
        console.log('\n2. Submitting Order...');
        const orderBody = {
            restaurantName: restaurantName,
            orderType: 'take_out',
            paymentMethod: 'cash',
            items: [{ id: 1, name: 'Test Pizza', price: 10, quantity: 1 }],
            totalPrice: 10,
            loyalty_id: testLoyaltyId
        };

        const event2 = {
            httpMethod: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderBody)
        };

        const res2 = await submitOrder(event2);
        const body2 = JSON.parse(res2.body);
        console.log('Submit Result:', res2.statusCode, body2);

        if (res2.statusCode !== 201) {
            console.error('❌ SUBMIT FAILED:', body2);
            throw new Error('Order submission failed');
        }

        // 3. Verify DB State Directly
        const dbRes = await query('SELECT * FROM loyalty_visitors WHERE device_id = $1', [testLoyaltyId]);
        const visitor = dbRes.rows[0];

        console.log('\n3. DB Verification:');
        console.log('Visitor Record:', {
            orders_in_current_session: visitor.orders_in_current_session,
            visit_count: visitor.visit_count,
            last_session_at: visitor.last_session_at
        });

        if (parseInt(visitor.orders_in_current_session) !== 1) {
            console.error('❌ FAILURE: orders_in_current_session is ' + visitor.orders_in_current_session + ', expected 1');
        } else {
            console.log('✅ SUCCESS: orders_in_current_session incremented correctly.');
        }

        // 4. Post-Order Status Check
        console.log('\n4. Checking Status After Order (Immediate)...');
        const res3 = await getStatus(event1);
        const body3 = JSON.parse(res3.body);
        console.log('Immediate Status:', {
            ordersInCurrentVisit: body3.ordersInCurrentVisit
        });

        if (body3.ordersInCurrentVisit !== 1) {
            console.error('❌ FAILURE: API returned ordersInCurrentVisit=' + body3.ordersInCurrentVisit);
        } else {
            console.log('✅ SUCCESS: API reflects the order count.');
        }

    } catch (err) {
        console.error('❌ TEST CRASHED:', err);
    } finally {
        process.exit();
    }
}

runTest();

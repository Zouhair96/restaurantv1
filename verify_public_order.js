
import dotenv from 'dotenv';
dotenv.config();
import { handler as getPublicOrder } from './netlify/functions/get-public-order.js';
import { query } from './netlify/functions/db.js';

async function runTest() {
    console.log('--- 🧪 STARTING PUBLIC ORDER VERIFICATION ---');

    try {
        // 1. Get Restaurant ID
        const uRes = await query('SELECT id FROM users WHERE restaurant_name IS NOT NULL LIMIT 1');
        if (uRes.rows.length === 0) throw new Error('No users found');
        const restaurantId = uRes.rows[0].id;

        console.log(`Using Restaurant ID: ${restaurantId}`);

        // 2. Insert Test Order
        const insertRes = await query(`
            INSERT INTO orders (restaurant_id, order_type, payment_method, total_price, status, items, created_at, updated_at)
            VALUES ($1, 'take_out', 'cash', 10.00, 'pending', '[]', NOW(), NOW())
            RETURNING id
        `, [restaurantId]);

        const newOrderId = insertRes.rows[0].id;
        console.log(`✅ Created Test Order ID: ${newOrderId}`);

        // 3. Try to fetch it using the Handler
        console.log(`\nAttempting to fetch Order ${newOrderId}...`);

        const event = {
            httpMethod: 'GET',
            queryStringParameters: { orderId: newOrderId.toString() }
        };

        const res = await getPublicOrder(event);
        console.log(`Response Status: ${res.statusCode}`);
        console.log('Response Body:', res.body);

        if (res.statusCode === 200) {
            console.log('✅ SUCCESS: Order found and returned.');
        } else {
            console.error('❌ FAILURE: Order not found or error occurred.');
            throw new Error('Fetch failed');
        }

    } catch (err) {
        console.error('❌ TEST FAILED:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runTest();

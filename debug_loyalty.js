
import dotenv from 'dotenv';
dotenv.config();
import { query } from './netlify/functions/db.js';

async function runDebug() {
    console.log('--- 🧪 DEBUGGING LOYALTY STATE ---');

    try {
        // 1. Get the most recent order (any status)
        console.log('\n--- Step 1: Fetching Last Order ---');
        const orderRes = await query(`
            SELECT id, restaurant_id, status, loyalty_id, created_at, updated_at 
            FROM orders 
            ORDER BY created_at DESC 
            LIMIT 1
        `);

        if (orderRes.rows.length === 0) {
            console.log('❌ No orders found in DB.');
            return;
        }

        const order = orderRes.rows[0];
        console.log(`📦 Order ID: ${order.id}`);
        console.log(`📍 Status: ${order.status}`);
        console.log(`🔑 Loyalty ID: ${order.loyalty_id}`);
        console.log(`🕒 Created: ${order.created_at}`);

        if (!order.loyalty_id) {
            console.log('❌ This order has NO loyalty ID attached.');
            return;
        }

        // 2. Check Visitor State
        console.log('\n--- Step 2: Fetching Visitor Record ---');
        const visitorRes = await query(`
            SELECT id, visit_count, orders_in_current_session, total_points, last_visit_at 
            FROM loyalty_visitors 
            WHERE restaurant_id = $1 AND device_id = $2
        `, [order.restaurant_id, order.loyalty_id]);

        if (visitorRes.rows.length === 0) {
            console.log('❌ No visitor record found for this loyalty ID.');
            return;
        }

        const visitor = visitorRes.rows[0];
        console.log(`👤 Visitor ID: ${visitor.id}`);
        console.log(`🔢 Visit Count: ${visitor.visit_count} (Should be >= 1 if order is completed)`);
        console.log(`🛒 Orders in Session: ${visitor.orders_in_current_session}`);
        console.log(`⭐ Total Points: ${visitor.total_points}`);

        // 3. Diagnosis
        console.log('\n--- DIAGNOSIS ---');
        if (order.status === 'completed') {
            if (parseInt(visitor.visit_count) > 0) {
                console.log('✅ Success: Order is completed and Visit Count > 0.');
                console.log('   Create a new order now to see Session 2 UI.');
            } else {
                console.error('❌ CRITICAL ERROR: Order is completed but Visit Count is 0.');
                console.error('   This means update-order-status.js failed to update the visitor record.');
            }
        } else {
            console.log('⚠️ Order is NOT completed yet.');
            console.log('   Please mark it as COMPLETED in the dashboard to increment visit count.');
        }

    } catch (err) {
        console.error('❌ ERROR:', err);
    } finally {
        process.exit(0);
    }
}

runDebug();

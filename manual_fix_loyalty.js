
import dotenv from 'dotenv';
dotenv.config();
import { query } from './netlify/functions/db.js';

async function manualFix() {
    console.log('--- 🔧 MANUAL FIX LOYALTY ---');
    try {
        // Find latest completed order with visit_count = 0
        const orderRes = await query(`
            SELECT id, restaurant_id, loyalty_id, created_at, total_price 
            FROM orders 
            WHERE status = 'completed' 
            ORDER BY created_at DESC 
            LIMIT 1
        `);

        if (orderRes.rows.length === 0) return console.log('❌ No orders.');
        const order = orderRes.rows[0];
        const { id: orderId, loyalty_id: loyaltyId, restaurant_id: restaurantId } = order;

        if (!loyaltyId) return console.log('❌ No loyalty ID.');

        // Check visitor
        const vRes = await query(`
            SELECT id, visit_count, orders_in_current_session FROM loyalty_visitors WHERE restaurant_id = $1 AND device_id = $2
        `, [restaurantId, loyaltyId]);

        const visitor = vRes.rows[0];
        if (!visitor) return console.log('❌ No visitor.');

        console.log(`[Before] Visit Count: ${visitor.visit_count}`);

        if (parseInt(visitor.visit_count) === 0) {
            console.log('⚡ Applying Fix: Setting visit_count = 1 and inserting Gift...');

            // 1. Update Visitor
            await query(`
                UPDATE loyalty_visitors 
                SET visit_count = 1, orders_in_current_session = 1, last_visit_at = NOW()
                WHERE id = $1
            `, [visitor.id]);

            // 2. Insert Gift (Welcome 10%)
            await query(`
                INSERT INTO gifts (restaurant_id, device_id, type, percentage_value, euro_value, status)
                VALUES ($1, $2, 'PERCENTAGE', 10, 0.00, 'unused')
            `, [restaurantId, loyaltyId]);

            console.log('✅ Fix Applied Successfully! Refresh your page.');
        } else {
            console.log('✅ Already fixed or valid.');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit(0);
    }
}

manualFix();

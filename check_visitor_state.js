import dotenv from 'dotenv';
dotenv.config();
import { query } from './netlify/functions/db.js';

async function checkVisitorState() {
    console.log('--- Checking Visitor State ---\n');

    try {
        // Get the most recent visitor (your test user)
        const res = await query(`
            SELECT 
                device_id,
                visit_count,
                orders_in_current_session,
                last_session_at,
                last_visit_at,
                created_at
            FROM loyalty_visitors 
            ORDER BY last_session_at DESC 
            LIMIT 5
        `);

        console.log('Recent Visitors:');
        res.rows.forEach((v, i) => {
            console.log(`\n${i + 1}. Device: ${v.device_id.substring(0, 20)}...`);
            console.log(`   visit_count: ${v.visit_count}`);
            console.log(`   orders_in_current_session: ${v.orders_in_current_session}`);
            console.log(`   last_session_at: ${v.last_session_at}`);
            console.log(`   last_visit_at: ${v.last_visit_at}`);

            // Calculate what session they're in
            const effectiveVisits = parseInt(v.visit_count) + 1;
            console.log(`   → Effective Session: ${effectiveVisits}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

checkVisitorState();

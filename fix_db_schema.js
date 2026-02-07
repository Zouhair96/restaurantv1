
import dotenv from 'dotenv';
dotenv.config();
import { query } from './netlify/functions/db.js';

async function fixSchema() {
    console.log('--- 🔧 FIXING DB SCHEMA ---');
    try {
        // 1. Make euro_value nullable and default to 0
        console.log('1. Altering gifts.euro_value...');
        await query(`
            ALTER TABLE gifts 
            ALTER COLUMN euro_value DROP NOT NULL;
        `);
        await query(`
            ALTER TABLE gifts 
            ALTER COLUMN euro_value SET DEFAULT 0;
        `);
        console.log('✅ gifts.euro_value is now safer.');

        // 2. Ensuring visit_count defaults to 0
        console.log('2. checking loyalty_visitors.visit_count...');
        await query(`
            ALTER TABLE loyalty_visitors 
            ALTER COLUMN visit_count SET DEFAULT 0;
        `);
        console.log('✅ loyalty_visitors.visit_count checked.');

    } catch (err) {
        console.error('❌ Schema Fix Error:', err);
    } finally {
        process.exit(0);
    }
}

fixSchema();

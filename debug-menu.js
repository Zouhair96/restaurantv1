import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_EML9WVupUz5t@ep-weathered-glade-ae8e9csk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const isLocal = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || FALLBACK_DB_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function debugMenu() {
    try {
        console.log('🔍 Checking Database State...');

        // 1. Check Users
        const users = await pool.query("SELECT id, name, email, restaurant_name FROM users");
        console.log('\n--- 👥 Users ---');
        users.rows.forEach(u => console.log(`${u.id}: ${u.name} (Rest: "${u.restaurant_name}")`));

        // 2. Check Menus
        const menus = await pool.query("SELECT id, user_id, name, config FROM menus WHERE name = 'Pizza Menu'");
        console.log('\n--- 🍕 Menus ---');
        menus.rows.forEach(m => {
            console.log(`Menu ${m.id} (User ${m.user_id}):`);
            const config = m.config;
            console.log(`  - Restaurant Name (Config): "${config.restaurantName}"`);
            console.log(`  - Theme Color: "${config.themeColor}"`);
            console.log(`  - Use Logo: ${config.useLogo}`);
            console.log(`  - Items Count: ${config.items ? config.items.length : 0}`);
        });

    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await pool.end();
    }
}

debugMenu();

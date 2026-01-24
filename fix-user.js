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

async function fixUser() {
    try {
        console.log('🔧 Fixing User 1 Restaurant Name...');

        await pool.query("UPDATE users SET restaurant_name = 'Pizza Time' WHERE id = 1");

        console.log("✅ Updated User 1 restaurant_name to 'Pizza Time'");

    } catch (error) {
        console.error('❌ Update failed:', error);
    } finally {
        await pool.end();
    }
}

fixUser();

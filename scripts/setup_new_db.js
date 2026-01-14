import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Simple .env parser (fallback if not loaded)
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
            }
        });
    } catch (e) { }
}

loadEnv();

if (!process.env.DATABASE_URL) {
    console.error("CRITICAL: DATABASE_URL is missing.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function setupDb() {
    console.log("🚀 Starting Database Initialization...");
    try {
        // 1. Create Users Table
        console.log("Creating 'users' table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                restaurant_name TEXT,
                address TEXT,
                phone_number TEXT,
                subscription_plan TEXT,
                subscription_status TEXT DEFAULT 'inactive',
                subscription_start_date TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ 'users' table created.");

        // 2. Create Menus Table
        console.log("Creating 'menus' table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS menus (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                template_type TEXT NOT NULL,
                config JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ 'menus' table created.");

    } catch (err) {
        console.error("❌ Migration Failed:", err);
    } finally {
        await pool.end();
        console.log("🏁 Database setup complete.");
    }
}

setupDb();

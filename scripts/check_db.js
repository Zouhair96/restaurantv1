import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Simple .env parser since we can't assume dotenv is installed or works with ESM easily without config
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
    } catch (e) {
        console.log("Note: Could not load .env file manually (might be fine if vars are already set)");
    }
}

loadEnv();

if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL is missing. Please check your .env file.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkDb() {
    try {
        console.log("Testing Database Connection...");
        const client = await pool.connect();
        console.log("✅ Connection Successful!");

        console.log("\nChecking Tables...");
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        if (res.rows.length === 0) {
            console.log("⚠️ No tables found in 'public' schema.");
        } else {
            console.log("Found Tables:");
            res.rows.forEach(row => console.log(` - ${row.table_name}`));
        }

        client.release();
    } catch (err) {
        console.error("❌ Database Error:", err.message);
    } finally {
        await pool.end();
    }
}

checkDb();

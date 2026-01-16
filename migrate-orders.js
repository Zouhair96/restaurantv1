import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const schemaPath = path.join(__dirname, 'orders_schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

async function migrateOrders() {
    try {
        console.log("Connecting to database...");
        const client = await pool.connect();
        console.log("Connected! Creating orders table...");
        await client.query(schemaSql);
        console.log("✓ Orders table created successfully!");
        client.release();
    } catch (err) {
        console.error("Error creating orders table:", err);
    } finally {
        await pool.end();
    }
}

migrateOrders();

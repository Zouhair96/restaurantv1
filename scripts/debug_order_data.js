import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function debugOrder() {
    try {
        // Fetch order #4 specifically (or any active order)
        const res = await pool.query("SELECT id, order_type, status, driver_name FROM orders WHERE status = 'preparing'");

        console.log("--- DEBUG ORDER DATA ---");
        res.rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Type: '${row.order_type}' (Length: ${row.order_type.length})`);
            console.log(`Status: '${row.status}'`);
            console.log(`Is Take Out? ${row.order_type === 'take_out'}`);
            console.log("------------------------");
        });

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

debugOrder();

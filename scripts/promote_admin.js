import pg from 'pg';
const { Pool } = pg;

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function promoteAdmin() {
    try {
        const email = 'Zouhair.benali96@gmail.com';
        await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
        console.log(`✅ User ${email} promoted to ADMIN.`);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

promoteAdmin();

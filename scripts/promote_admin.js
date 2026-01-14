import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://neondb_owner:npg_K7WXZeLJY0Sv@ep-old-fire-ae5lg5tk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
    connectionString,
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

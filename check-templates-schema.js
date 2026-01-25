import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = "postgresql://neondb_owner:npg_EML9WVupUz5t@ep-weathered-glade-ae8e9csk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'templates'");
        console.log("Templates Columns:", res.rows);

        const data = await pool.query("SELECT * FROM templates LIMIT 1");
        console.log("Template Sample Data:", data.rows[0]);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pool.end();
    }
}

check();

import pg from 'pg';
const { Pool } = pg;

// Strict Environment Enforcement: No fallback, no default URL.
if (!process.env.DATABASE_URL) {
    throw new Error("CRITICAL: DATABASE_URL environment variable is missing. The application cannot start without a valid database connection string.");
}

let pool;
if (!pool) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1, // Crucial for Vercel/Supabase Serverless
        ssl: { rejectUnauthorized: false }
    });
}

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
export { pool };

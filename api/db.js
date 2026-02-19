import pg from 'pg';
const { Pool } = pg;

// Use a global variable to persist the pool across function invocations
let pool;

if (!pool) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1, // Crucial for Serverless!
        ssl: { rejectUnauthorized: false }
    });
}

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
export { pool }; // Exporting the pool itself if needed

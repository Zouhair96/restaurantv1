import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Try to find it in the root from functions/
dotenv.config(); // Also try standard

const { Pool } = pg;

// Enforce Environment Variable
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_HJZ2tis5obwE@ep-purple-rice-aegm5zg0-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is missing. Using New Fallback URL.");
}

const isLocal = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || FALLBACK_DB_URL,
    ssl: isLocal ? false : {
        rejectUnauthorized: false
    }
});

export const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (error) {
        console.error("Database Query Error:", {
            message: error.message,
            stack: error.stack,
            query: text
        });
        throw error;
    }
};

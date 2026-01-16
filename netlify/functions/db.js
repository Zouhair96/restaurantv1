import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Enforce Environment Variable - SOFTENED for stability
// Default to the new working URL if env var is missing
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_1nr6sQcfLWDN@ep-flat-wave-aerpssmv-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is missing. Using Fallback URL.");
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

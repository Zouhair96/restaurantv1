import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Root from functions/
dotenv.config({ path: './.env' });      // Local
dotenv.config();                        // Standard path lookup

const { Pool } = pg;

// Enforce Environment Variable
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_9WJ1KftjwRer@ep-orange-cake-ae3139wl-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is missing. Using New Fallback URL.");
}

const isLocal = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || FALLBACK_DB_URL,
    max: 15,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
    ssl: isLocal ? false : {
        rejectUnauthorized: false
    }
});

// Cache the pool to prevent multiple instances in serverless environments
let isPoolInitialized = false;

export const query = async (text, params) => {
    const start = Date.now();
    try {
        // Simple connectivity check if first time
        if (!isPoolInitialized) {
            await pool.query('SELECT 1');
            isPoolInitialized = true;
            console.log('Database pool initialized successfully');
        }

        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 5000) {
            console.warn(`Slow query (${duration}ms):`, text);
        }
        return res;
    } catch (error) {
        console.error("Database Query Error:", {
            message: error.message,
            query: text,
            params: params ? JSON.stringify(params) : 'none'
        });

        // Handle specific connection errors
        if (error.message.includes('timeout') || error.message.includes('connection')) {
            throw new Error("The database is currently waking up or under high load. Please try again in a few seconds.");
        }

        throw error;
    }
};

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
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    ssl: isLocal ? false : {
        rejectUnauthorized: false
    }
});

// Cache the pool to prevent multiple instances in serverless environments
let isPoolInitialized = false;

export const query = async (text, params) => {
    try {
        if (!isPoolInitialized) {
            await pool.query('SELECT 1');
            isPoolInitialized = true;
        }
        return await pool.query(text, params);
    } catch (error) {
        console.error("DB Error:", error.message);
        throw error;
    }
};

export const getClient = async () => {
    const client = await pool.connect();
    return client;
};

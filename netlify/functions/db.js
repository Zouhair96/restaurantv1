import pg from 'pg';
const { Pool } = pg;

// Enforce Environment Variable - SOFTENED for stability
// Default to the new working URL if env var is missing
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_A2ZDmPEvJ7ud@ep-aged-moon-ah85ucw4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is missing. Using Fallback URL.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || FALLBACK_DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const query = (text, params) => pool.query(text, params);

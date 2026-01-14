const { Pool } = require('pg');

// For local development, load .env file if available
try {
    require('dotenv').config();
} catch (e) {
    // dotenv might not be available in production or if not installed, which is fine for Netlify 
    // as it injects vars automatically. But valid for local `node` runs.
}

// Enforce Environment Variable
if (!process.env.DATABASE_URL) {
    throw new Error("CRITICAL: DATABASE_URL is missing! Please set this in your Netlify Environment Variables.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};

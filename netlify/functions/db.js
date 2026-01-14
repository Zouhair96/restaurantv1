const { Pool } = require('pg');

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

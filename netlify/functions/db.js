const { Pool } = require('pg');

// For local development, load .env file if available (Zero-dependency version)
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                // Remove quotes and whitespace
                process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
            }
        });
    }
} catch (e) {
    // Ignore error if file doesn't exist
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

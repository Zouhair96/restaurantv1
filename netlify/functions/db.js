const { Pool } = require('pg');

// For local development, load .env file if available (Zero-dependency version)
const fs = require('fs');
const path = require('path');

try {
    // Try multiple paths to find .env
    const pathsToCheck = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(__dirname, '../../.env'),
        path.resolve(__dirname, '../.env'),
        path.resolve(process.cwd(), '..', '.env')
    ];

    let envPath = null;
    for (const p of pathsToCheck) {
        if (fs.existsSync(p)) {
            envPath = p;
            break;
        }
    }

    if (envPath) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            // Skip comments and empty lines
            if (!line || line.startsWith('#')) return;

            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts.shift().trim();
                let value = parts.join('=').trim();

                // Remove surrounding quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length - 1);
                }

                process.env[key] = value;
            }
        });
    }
} catch (e) {
    // Ignore error if file doesn't exist
}

// Enforce Environment Variable - SOFTENED for stability
// Default to the new working URL if env var is missing
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_dV5QMK4YHegU@ep-late-pine-aeobw0le-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is missing. Using Fallback URL.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || FALLBACK_DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};

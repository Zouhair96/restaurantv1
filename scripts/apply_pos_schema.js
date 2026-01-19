import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function applySchema() {
    console.log('🔄 Creating restaurant_api_keys table...');

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS restaurant_api_keys (
            id SERIAL PRIMARY KEY,
            restaurant_id INT REFERENCES users(id) ON DELETE CASCADE,
            key_name TEXT NOT NULL,
            key_hash TEXT NOT NULL,
            last_used TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log('✅ Table restaurant_api_keys created successfully.');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await pool.end();
    }
}

applySchema();

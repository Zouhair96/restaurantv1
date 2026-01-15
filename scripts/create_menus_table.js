import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createMenusTable() {
    console.log('🏗️ Creating menus table...');

    try {
        const query = `
            CREATE TABLE IF NOT EXISTS menus (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                template_type TEXT NOT NULL,
                config JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await pool.query(query);
        console.log('✅ Success! Table "menus" created (or already exists).');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await pool.end();
    }
}

createMenusTable();

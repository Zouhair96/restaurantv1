import pg from 'pg';
const { Pool } = pg;

// Connection string from db.js
const connectionString = "postgresql://neondb_owner:npg_K7WXZeLJY0Sv@ep-old-fire-ae5lg5tk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
    connectionString,
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

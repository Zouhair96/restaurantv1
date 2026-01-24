import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_EML9WVupUz5t@ep-weathered-glade-ae8e9csk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const isLocal = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || FALLBACK_DB_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('🚀 Starting migration: Creating templates table...');

        const query = `
            CREATE TABLE IF NOT EXISTS templates (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                template_key TEXT UNIQUE NOT NULL,
                icon TEXT,
                image_url TEXT,
                description TEXT,
                allowed_plans JSONB DEFAULT '[]',
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Seed with the existing Pizza Time template if it doesn't exist
            INSERT INTO templates (name, template_key, icon, image_url, description, allowed_plans)
            VALUES (
                'Pizza Time', 
                'pizza1', 
                '🍕', 
                'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1000', 
                'Clean & Modern Pizza Display', 
                '["starter", "pro", "enterprise"]'
            )
            ON CONFLICT (template_key) DO NOTHING;
        `;

        await pool.query(query);
        console.log('✅ Templates table created and seeded!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_9WJ1KftjwRer@ep-orange-cake-ae3139wl-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const isLocal = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || FALLBACK_DB_URL,
    ssl: isLocal ? false : {
        rejectUnauthorized: false
    }
});

async function initializeDatabase() {
    try {
        console.log('🚀 Starting database initialization...');

        // Read the schema file
        const schemaPath = path.join(__dirname, 'complete_db_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute the schema
        await pool.query(schema);

        console.log('✅ Database schema initialized successfully!');
        console.log('📊 Tables created/verified:');
        console.log('   - users');
        console.log('   - menus');
        console.log('   - orders');

        // Verify tables exist
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        console.log('\n📋 Existing tables in database:');
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initializeDatabase();

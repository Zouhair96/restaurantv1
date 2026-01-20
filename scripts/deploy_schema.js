import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env manually
function loadEnv() {
    try {
        const envPath = path.resolve(rootDir, '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
            }
        });
    } catch (e) {
        console.log("Note: Could not load .env file manually");
    }
}

loadEnv();

if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL is missing.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function deploySchema() {
    try {
        console.log('🚀 Connecting to database...');
        const client = await pool.connect();
        console.log('✅ Connected!');

        console.log('📖 Reading schema...');
        const schemaPath = path.join(rootDir, 'complete_db_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('⚡ Executing schema...');
        await client.query(schema);
        console.log('✅ Schema executed successfully!');

        client.release();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

deploySchema();

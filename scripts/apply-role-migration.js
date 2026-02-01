import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
};

async function migrate() {
    const client = new Client(config);
    try {
        await client.connect();

        console.log('--- STARTING SCHEMA MIGRATION ---');

        // 1. Add new columns if they don't exist
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS login_type TEXT DEFAULT 'EMAIL',
            ADD COLUMN IF NOT EXISTS pin_hash TEXT,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('✅ New columns added to users table.');

        // 2. Update Role Logic
        console.log('--- UPDATING ROLES ---');

        // Admin mapping
        const adminRes = await client.query("UPDATE users SET role = 'ADMIN' WHERE role = 'admin' RETURNING id, email");
        console.log(`✅ Updated ${adminRes.rowCount} admins to ADMIN.`);

        // Owner mapping (all others except staff which doesn't exist yet)
        const ownerRes = await client.query("UPDATE users SET role = 'OWNER' WHERE role IN ('user', 'client') RETURNING id, email");
        console.log(`✅ Updated ${ownerRes.rowCount} users/clients to OWNER.`);

        // 3. For existing Owners, set their restaurant_id to their own ID 
        // (Since they are currently independent restaurants)
        await client.query(`
            UPDATE users 
            SET restaurant_id = id 
            WHERE role = 'OWNER' AND restaurant_id IS NULL
        `);
        console.log('✅ Set restaurant_id for existing owners.');

        console.log('--- MIGRATION COMPLETE ---');

    } catch (err) {
        console.error('❌ Migration Failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();

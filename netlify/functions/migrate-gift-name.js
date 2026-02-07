import { query } from './db.js';

async function runMigration() {
    console.log('Migrating gifts table to support item rewards...');
    try {
        // 1. Add gift_name column
        await query(`ALTER TABLE gifts ADD COLUMN IF NOT EXISTS gift_name TEXT`).catch(e => console.log(e.message));

        // 2. Update type constraint to include 'ITEM'
        // First drop existing check if possible
        await query(`ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_type_check`).catch(e => console.log(e.message));

        // Add new check
        await query(`ALTER TABLE gifts ADD CONSTRAINT gifts_type_check CHECK (type IN ('FIXED_VALUE', 'PERCENTAGE', 'ITEM'))`).catch(e => console.log(e.message));

        console.log('Migration completed.');
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

runMigration();

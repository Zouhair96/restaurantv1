import { query } from './netlify/functions/db.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.resolve('billing_migration.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running billing migration...');
        await query(sql);
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();

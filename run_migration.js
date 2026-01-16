import { query } from './netlify/functions/db.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.resolve('client_auth_migration.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running migration...');

        // Split by semicolon and filter empty statements
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await query(statement);
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();

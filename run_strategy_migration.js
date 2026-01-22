import { query } from './netlify/functions/db.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.resolve('strategy_migration.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running strategy migration...');

        // Split by semicolon but handle the DO $$ blocks which might contain semicolons
        // In this case, since I used DO blocks, I can just execute the whole file or split carefully.
        // For simplicity and since these are specific blocks, I'll execute the whole content if it's one block 
        // or split by a very specific pattern. 
        // Actually, the simplest is to just execute the whole thing as one multi-statement query if pg allows it.
        // Alternatively, I can split by "--" or similar, but let's try the whole block.

        await query(sql);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();

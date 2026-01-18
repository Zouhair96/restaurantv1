/**
 * Migration Script for Generated Menus Feature
 * 
 * This script creates the necessary tables for the AI Menu Generator feature
 * on the production database.
 * 
 * Usage:
 *   node run_generated_menus_migration.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting Generated Menus migration...\n');

        // Read the schema file
        const schemaPath = join(__dirname, 'generated_menus_schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');

        console.log('📄 Executing schema from generated_menus_schema.sql...');

        // Execute the schema
        await client.query(schema);

        console.log('✅ Schema executed successfully!\n');

        // Verify tables were created
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('generated_menus', 'generated_menu_items')
            ORDER BY table_name
        `);

        console.log('📋 Verified tables:');
        tablesResult.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });

        // Count existing records
        const menusCount = await client.query('SELECT COUNT(*) FROM generated_menus');
        const itemsCount = await client.query('SELECT COUNT(*) FROM generated_menu_items');

        console.log('\n📊 Current data:');
        console.log(`   - Generated menus: ${menusCount.rows[0].count}`);
        console.log(`   - Menu items: ${itemsCount.rows[0].count}`);

        console.log('\n✨ Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error(error.message);
        console.error('\nFull error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => {
        console.log('\n👍 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration encountered an error');
        process.exit(1);
    });

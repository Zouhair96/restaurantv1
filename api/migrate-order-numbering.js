import { query } from './db.js';

/**
 * Migration: Add Order Numbering System
 * - Adds order_number column to orders table
 * - Adds order_number_config column to users table
 */

const runMigration = async () => {
    console.log('🚀 Starting Order Numbering Migration...\n');

    try {
        // 1. Add order_number column to orders table
        console.log('📋 Adding order_number column to orders table...');
        await query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS order_number INTEGER;
        `);
        console.log('✅ order_number column added successfully\n');

        // 2. Add order_number_config column to users table
        console.log('⚙️  Adding order_number_config column to users table...');
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS order_number_config JSONB 
            DEFAULT '{"starting_number": 1, "current_number": 1, "reset_period": "never", "weekly_start_day": 1, "last_reset_date": null}';
        `);
        console.log('✅ order_number_config column added successfully\n');

        // 3. Verify columns were added
        console.log('🔍 Verifying migration...');
        const ordersCheck = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'order_number';
        `);

        const usersCheck = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'order_number_config';
        `);

        if (ordersCheck.rows.length > 0 && usersCheck.rows.length > 0) {
            console.log('✅ Migration verified successfully!\n');
            console.log('📊 Migration Summary:');
            console.log('   - orders.order_number: INTEGER');
            console.log('   - users.order_number_config: JSONB');
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('⚠️  Warning: Could not verify all columns');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Run migration
runMigration()
    .then(() => {
        console.log('\n✨ All done! You can now use the order numbering system.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

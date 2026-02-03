import { query } from './db.js';

async function runMigration() {
    console.log('Starting migration for Points & Session System...');

    try {
        // 1. Update loyalty_visitors table
        console.log('Updating loyalty_visitors table...');
        await query(`
            ALTER TABLE loyalty_visitors 
            ADD COLUMN IF NOT EXISTS last_counted_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0
        `);

        // 2. Create gifts table
        console.log('Creating gifts table...');
        await query(`
            CREATE TABLE IF NOT EXISTS gifts (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                device_id TEXT NOT NULL,
                euro_value NUMERIC(12, 2) NOT NULL,
                status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'consumed')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Create points_transactions table
        console.log('Creating points_transactions table...');
        await query(`
            CREATE TABLE IF NOT EXISTS points_transactions (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                device_id TEXT NOT NULL,
                order_id INTEGER UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
                type TEXT NOT NULL CHECK (type IN ('EARN', 'REDEEM', 'CONVERT_GIFT')),
                amount INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();

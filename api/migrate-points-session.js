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

        // CLEANUP: Drop legacy session flag if exists
        await query(`ALTER TABLE loyalty_visitors DROP COLUMN IF EXISTS reward_used_in_session`).catch(() => { });

        // 2. Create/Update gifts table
        console.log('Creating/Updating gifts table...');
        await query(`
            CREATE TABLE IF NOT EXISTS gifts (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                device_id TEXT NOT NULL,
                euro_value NUMERIC(12, 2) DEFAULT 0,
                type TEXT DEFAULT 'FIXED_VALUE' CHECK (type IN ('FIXED_VALUE', 'PERCENTAGE')),
                percentage_value NUMERIC(5, 2),
                order_id INTEGER,
                status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'consumed', 'converted')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration for existing table if it exists without new columns
        await query(`ALTER TABLE gifts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'FIXED_VALUE'`).catch(() => { });
        await query(`ALTER TABLE gifts ADD COLUMN IF NOT EXISTS percentage_value NUMERIC(5, 2)`).catch(() => { });
        await query(`ALTER TABLE gifts ADD COLUMN IF NOT EXISTS order_id INTEGER`).catch(() => { });
        await query(`
            ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_status_check;
            ALTER TABLE gifts ADD CONSTRAINT gifts_status_check CHECK (status IN ('unused', 'consumed', 'converted'));
        `).catch(() => { });

        // 3. Create/Update points_transactions table
        console.log('Creating points_transactions table...');
        await query(`
            CREATE TABLE IF NOT EXISTS points_transactions (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                device_id TEXT NOT NULL,
                order_id INTEGER UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
                gift_id INTEGER UNIQUE,
                type TEXT NOT NULL CHECK (type IN ('EARN', 'REDEEM', 'CONVERT_GIFT')),
                amount INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await query(`ALTER TABLE points_transactions ADD COLUMN IF NOT EXISTS gift_id INTEGER`).catch(() => { });
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'points_transactions_gift_id_key') THEN
                    ALTER TABLE points_transactions ADD CONSTRAINT points_transactions_gift_id_key UNIQUE (gift_id);
                END IF;
            END $$;
        `).catch(() => { });

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();

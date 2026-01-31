import { query } from '../netlify/functions/db.js';

const runMigration = async () => {
    try {
        console.log('Creating loyalty_visitors table...');
        await query(`
            CREATE TABLE IF NOT EXISTS loyalty_visitors (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                restaurant_id INTEGER NOT NULL,
                device_id TEXT NOT NULL,
                visit_count INTEGER DEFAULT 0,
                last_session_at TIMESTAMP WITH TIME ZONE,
                last_visit_at TIMESTAMP WITH TIME ZONE,
                current_step TEXT DEFAULT 'NEW',
                orders_in_current_session INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(restaurant_id, device_id)
            );
        `);
        console.log('Table loyalty_visitors created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();

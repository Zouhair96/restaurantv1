import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
    console.log('🔄 Checking database schema...');

    try {
        // 1. Add 'address' column
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`);
        console.log('✅ Checked/Added column: address');

        // 2. Add 'phone_number' column
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;`);
        console.log('✅ Checked/Added column: phone_number');

        // 3. Add 'restaurant_name' (just in case)
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS restaurant_name TEXT;`);
        console.log('✅ Checked/Added column: restaurant_name');

        // 4. Add 'role' column (default 'user')
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';`);
        console.log('✅ Checked/Added column: role');

        console.log('\n🎉 Schema update complete! You can now register users.');
    } catch (error) {
        console.error('❌ Error updating schema:', error);
    } finally {
        await pool.end();
    }
}

updateSchema();

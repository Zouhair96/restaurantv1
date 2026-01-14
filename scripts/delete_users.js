import pg from 'pg';
const { Pool } = pg;

// Connection string copied from db.js
const connectionString = "postgresql://neondb_owner:npg_K7WXZeLJY0Sv@ep-old-fire-ae5lg5tk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function deleteAllUsers() {
    console.log('⚠️  WARNING: About to DELETE ALL USERS from the database...');
    console.log('Waiting 3 seconds before proceeding...');

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        const result = await pool.query('DELETE FROM users');
        console.log(`✅ Success! Deleted ${result.rowCount} users from the database.`);
    } catch (error) {
        console.error('❌ Error deleting users:', error);
    } finally {
        await pool.end();
    }
}

deleteAllUsers();

import { query } from './netlify/functions/db.js';

async function checkSchema() {
    try {
        console.log('Checking users table schema...');
        const usersResult = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Users Table Columns:');
        usersResult.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));

        console.log('\nChecking orders table schema...');
        const ordersResult = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders'
        `);
        console.log('Orders Table Columns:');
        ordersResult.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));

        process.exit(0);
    } catch (error) {
        console.error('Schema check failed:', error);
        process.exit(1);
    }
}

checkSchema();

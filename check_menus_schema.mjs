import { query } from './netlify/functions/db.js';

async function checkMenusSchema() {
    try {
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'menus'
        `);
        console.log("Menus Table Columns:");
        res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));

        // Check constraints
        const constraints = await query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c 
            JOIN pg_namespace n ON n.oid = c.connamespace 
            WHERE conrelid = 'menus'::regclass::oid
        `);
        console.log("\nConstraints:");
        constraints.rows.forEach(r => console.log(`- ${r.conname}: ${r.pg_get_constraintdef}`));

    } catch (err) {
        console.error("Error:", err);
    }
}

checkMenusSchema();

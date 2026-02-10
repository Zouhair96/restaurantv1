import { query } from './netlify/functions/db.js';

async function inspectTable() {
    try {
        const res = await query("SELECT * FROM template_items LIMIT 1");
        console.log('Columns:', res.fields.map(f => f.name));
        console.log('Sample Row:', res.rows[0]);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
inspectTable();

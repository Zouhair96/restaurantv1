import { query } from './db.js';

export default async function handler(req, res) {
    try {
        const tables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        const columnInfo = {};
        for (const table of tables.rows) {
            const cols = await query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table.table_name]);
            columnInfo[table.table_name] = cols.rows;
        }

        return res.status(200).json({
            tables: tables.rows.map(t => t.table_name),
            columns: columnInfo
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

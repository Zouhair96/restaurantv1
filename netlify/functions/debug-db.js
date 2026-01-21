import { query } from './db.js';

export const handler = async (event, context) => {
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

        return {
            statusCode: 200,
            body: JSON.stringify({
                tables: tables.rows.map(t => t.table_name),
                columns: columnInfo
            }, null, 2)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

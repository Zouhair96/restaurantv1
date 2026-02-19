import { query } from './db.js';

export default async function handler(req, res) {
    try {
        console.log('Migrating order numbering config...');
        await query(`
            UPDATE users 
            SET order_number_config = '{"startNumber": 1, "resetPeriod": "daily"}'::jsonb 
            WHERE order_number_config IS NULL
        `);
        return res.status(200).json({ success: true, message: 'Order numbering config migrated' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

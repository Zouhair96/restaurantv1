import { query } from './db.js';

export default async function handler(req, res) {
    try {
        console.log('Fixing gifts status constraint...');
        await query(`
            ALTER TABLE gifts 
            DROP CONSTRAINT IF EXISTS gifts_status_check
        `);
        await query(`
            ALTER TABLE gifts 
            ADD CONSTRAINT gifts_status_check 
            CHECK (status IN ('unused', 'used', 'converted', 'reverted'))
        `);
        return res.status(200).json({ success: true, message: 'Constraint updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

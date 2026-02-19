import { query } from './db.js';

export default async function handler(req, res) {
    try {
        console.log('Migrating gift names...');
        await query(`
            UPDATE gifts 
            SET gift_name = CASE 
                WHEN gift_type = 'percentage' THEN gift_value || '% Discount'
                WHEN gift_type = 'fixed' THEN '€' || gift_value || ' Discount'
                WHEN gift_type = 'item' THEN 'Free ' || gift_value
                ELSE gift_name
            END
            WHERE gift_name IS NULL OR gift_name = ''
        `);
        return res.status(200).json({ success: true, message: 'Gift names migrated' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

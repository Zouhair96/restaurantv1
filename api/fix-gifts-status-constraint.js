import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        console.log('[Migration] Starting gifts status constraint fix...');

        // Drop the old constraint and add the new one with 'converted' status
        await query(`
            ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_status_check;
        `);

        console.log('[Migration] Old constraint dropped');

        await query(`
            ALTER TABLE gifts ADD CONSTRAINT gifts_status_check 
            CHECK (status IN ('unused', 'consumed', 'converted'));
        `);

        console.log('[Migration] New constraint added with converted status');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Gifts status constraint updated successfully'
            })
        };

    } catch (error) {
        console.error('[Migration] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Migration failed',
                details: error.message
            })
        };
    }
};

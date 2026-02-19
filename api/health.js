// api/health.js
import { query } from './db.js';

export default async function handler(req, res) {
    try {
        await query('SELECT 1');
        res.status(200).json({ status: 'ok' });
    } catch {
        res.status(500).json({ status: 'db_error' });
    }
}

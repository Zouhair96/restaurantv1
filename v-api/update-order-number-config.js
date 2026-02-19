import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });

        const decoded = jwt.verify(token, secret);
        const restaurantId = decoded.id;

        const { starting_number, reset_period, weekly_start_day } = req.body;

        if (!starting_number || starting_number < 1) {
            return res.status(400).json({ error: 'Starting number must be at least 1' });
        }

        const validPeriods = ['never', 'daily', 'weekly', 'monthly'];
        if (!validPeriods.includes(reset_period)) {
            return res.status(400).json({ error: 'Invalid reset period' });
        }

        if (reset_period === 'weekly' && (weekly_start_day < 0 || weekly_start_day > 6)) {
            return res.status(400).json({ error: 'Weekly start day must be 0-6' });
        }

        const currentResult = await query('SELECT order_number_config FROM users WHERE id = $1', [restaurantId]);
        const currentConfig = currentResult.rows[0]?.order_number_config || {};
        const startingNumberChanged = parseInt(starting_number) !== parseInt(currentConfig.starting_number || 1);

        const newConfig = {
            ...currentConfig,
            starting_number: parseInt(starting_number),
            reset_period,
            weekly_start_day: reset_period === 'weekly' ? (parseInt(weekly_start_day) || 1) : 1,
            current_number: startingNumberChanged ? parseInt(starting_number) : (currentConfig.current_number || parseInt(starting_number)),
            last_reset_date: startingNumberChanged ? null : (currentConfig.last_reset_date || null)
        };

        await query('UPDATE users SET order_number_config = $1 WHERE id = $2', [JSON.stringify(newConfig), restaurantId]);

        return res.status(200).json({
            success: true,
            message: 'Order numbering settings updated successfully',
            config: newConfig
        });

    } catch (error) {
        console.error('Update Order Number Config Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

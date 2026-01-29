import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// GET: Fetch Loyalty Stats & Config
router.get('/loyalty-analytics', authenticate, async (req, res) => {
    try {
        const restaurantId = req.user.id;

        // Ensure column exists (one-time check for dev)
        try {
            await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_config JSONB DEFAULT '{"isAutoPromoOn": true, "recoveryConfig": {"type": "discount", "value": "20", "active": true, "delay": "21", "frequency": "30"}}'`);

            // Create visitor_events table if missing
            await query(`
                CREATE TABLE IF NOT EXISTS visitor_events (
                    id SERIAL PRIMARY KEY,
                    restaurant_id INT REFERENCES users(id),
                    visitor_uuid TEXT,
                    event_type TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } catch (dbErr) {
            // Ignore error if column exists
        }

        const configResult = await query('SELECT loyalty_config FROM users WHERE id = $1', [restaurantId]);
        if (configResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        let stats = { loyal_count: 0, offers_applied: 0, loyalty_revenue: 0 };
        try {
            const statsQuery = `
                SELECT 
                    (SELECT COUNT(DISTINCT visitor_uuid) FROM visitor_events WHERE restaurant_id = $1 AND event_type = 'loyal_status_reached') as loyal_count,
                    (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND loyalty_discount_applied = true) as offers_applied,
                    (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE restaurant_id = $1 AND status != 'cancelled' AND loyalty_discount_applied = true) as loyalty_revenue
            `;
            const statsResult = await query(statsQuery, [restaurantId]);
            stats = statsResult.rows[0] || stats;
        } catch (statsErr) {
            console.warn('[Loyalty] Stats fetch failed:', statsErr.message);
        }

        res.json({
            loyal_clients: parseInt(stats.loyal_count || 0),
            offers_applied: parseInt(stats.offers_applied || 0),
            loyalty_revenue: parseFloat(stats.loyalty_revenue || 0).toFixed(2),
            loyalty_config: configResult.rows[0].loyalty_config
        });
    } catch (error) {
        console.error('Loyalty Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty data' });
    }
});

// POST: Update Loyalty Config
router.post('/loyalty-analytics', authenticate, async (req, res) => {
    try {
        const restaurantId = req.user.id;
        const { configUpdate } = req.body;

        if (!configUpdate) return res.status(400).json({ error: 'Missing config update' });

        const updateRes = await query(
            'UPDATE users SET loyalty_config = COALESCE(loyalty_config, \'{}\'::jsonb) || $1::jsonb WHERE id = $2 RETURNING loyalty_config',
            [JSON.stringify(configUpdate), restaurantId]
        );

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, loyalty_config: updateRes.rows[0].loyalty_config });
    } catch (error) {
        console.error('Loyalty Update Error:', error);
        res.status(500).json({ error: 'Failed to update loyalty config' });
    }
});

export default router;

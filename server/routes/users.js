import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();

// Middleware to verify token
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// GET /api/admin-users - Get users (Admin only)
router.get('/admin-users', authenticate, async (req, res) => {
    try {
        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
        }

        const result = await query('SELECT id, name, email, role, subscription_plan, subscription_status, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Admin Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/subscribe - Subscribe user
router.post('/subscribe', authenticate, async (req, res) => {
    try {
        const { plan, paymentMethod } = req.body;

        // Handle if plan is an object or string
        const planName = typeof plan === 'object' ? plan.name : plan;

        // Simulate subscription logic
        const status = 'active';
        const startDate = new Date().toISOString();

        const result = await query(
            `UPDATE users 
       SET subscription_plan = $1, subscription_status = $2, subscription_start_date = $3
       WHERE id = $4
       RETURNING id, name, email, role, subscription_plan, subscription_status`,
            [planName, status, startDate, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Subscription successful', user: result.rows[0] });

    } catch (error) {
        console.error('Subscribe Error:', error);
        res.status(500).json({ error: 'Subscription failed' });
    }
});

// POST /api/unsubscribe - Unsubscribe user
router.post('/unsubscribe', authenticate, async (req, res) => {
    try {
        const result = await query(
            `UPDATE users 
       SET subscription_status = 'inactive'
       WHERE id = $1
       RETURNING id, name, email, role, subscription_plan, subscription_status`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Unsubscribed successfully', user: result.rows[0] });

    } catch (error) {
        console.error('Unsubscribe Error:', error);
        res.status(500).json({ error: 'Unsubscription failed' });
    }
});

export default router;

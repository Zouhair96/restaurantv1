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

// GET /api/menus - Get all menus for the logged-in user
router.get('/menus', authenticate, async (req, res) => {
    try {
        const result = await query('SELECT * FROM menus WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get Menus Error:', error);
        res.status(500).json({ error: 'Failed to fetch menus' });
    }
});

// POST /api/menus - Create a new menu
router.post('/menus', authenticate, async (req, res) => {
    try {
        const { name, template_type, config } = req.body;

        // Check limit (1 menu per user)
        const existing = await query('SELECT id FROM menus WHERE user_id = $1', [req.user.id]);
        if (existing.rows.length >= 1) {
            return res.status(403).json({ error: 'Menu limit reached (Max 1 per user)' });
        }

        const result = await query(
            `INSERT INTO menus (user_id, name, template_type, config)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [req.user.id, name, template_type, config]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create Menu Error:', error);
        res.status(500).json({ error: 'Failed to create menu' });
    }
});

// PUT /api/menus/:id - Update a menu
router.put('/menus/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, config } = req.body;

        // Ensure user owns the menu
        const check = await query('SELECT id FROM menus WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Menu not found or unauthorized' });
        }

        const result = await query(
            `UPDATE menus SET name = $1, config = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
            [name, config, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update Menu Error:', error);
        res.status(500).json({ error: 'Failed to update menu' });
    }
});

// DELETE /api/menus/:id - Delete a menu
router.delete('/menus/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM menus WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Menu not found or unauthorized' });
        }

        res.json({ message: 'Menu deleted' });
    } catch (error) {
        console.error('Delete Menu Error:', error);
        res.status(500).json({ error: 'Failed to delete menu' });
    }
});

// Public Menu Route (No Auth)
// GET /api/public-menu?restaurant=Name
router.get('/public-menu', async (req, res) => {
    try {
        const { restaurant } = req.query;
        if (!restaurant) {
            return res.status(400).json({ error: 'Restaurant name is required' });
        }

        // Find the user by restaurant name? Or directly find menu if it has restaurant name?
        // The previous implementation looked up the user first by restaurant_name

        // Find user with this restaurant name
        // Note: This relies on how the frontend passes the restaurant identifier.
        // Assuming frontend passes the User's "Restaurant Name"
        const userResult = await query('SELECT id FROM users WHERE restaurant_name = $1', [restaurant]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const userId = userResult.rows[0].id;

        // Get the menu for this user
        const menuResult = await query('SELECT * FROM menus WHERE user_id = $1', [userId]);

        if (menuResult.rows.length === 0) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        res.json(menuResult.rows[0]);
    } catch (error) {
        console.error('Public Menu Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

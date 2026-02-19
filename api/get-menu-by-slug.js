import { query } from './db.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { slug } = req.query;

        if (!slug) {
            return res.status(400).json({ error: 'Menu slug is required' });
        }

        // Get menu
        const menuResult = await query(
            'SELECT * FROM generated_menus WHERE slug = $1 AND status = $2',
            [slug, 'active']
        );
        const menu = menuResult.rows[0];

        if (!menu) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        // Get menu items
        const itemsResult = await query(
            'SELECT * FROM generated_menu_items WHERE menu_id = $1 AND is_available = $2 ORDER BY sort_order ASC, id ASC',
            [menu.id, true]
        );
        const items = itemsResult.rows;

        return res.status(200).json({
            success: true,
            menu: menu,
            items: items,
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        return res.status(500).json({ error: 'Failed to fetch menu', details: error.message });
    }
}

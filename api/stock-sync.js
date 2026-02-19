import { query } from './db.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
        // const restaurantId = await validateApiKey(apiKey);
        const restaurantId = 1; // DUMMY for testing

        const { itemId, isAvailable } = req.body;

        if (itemId === undefined || isAvailable === undefined) {
            return res.status(400).json({ error: 'Missing itemId or isAvailable' });
        }

        const genResult = await query(
            'UPDATE generated_menu_items SET is_available = $1, updated_at = NOW() WHERE id = $2 AND menu_id IN (SELECT id FROM generated_menus WHERE user_id = $3) RETURNING id',
            [isAvailable, itemId, restaurantId]
        );

        if (genResult.rowCount > 0) {
            return res.status(200).json({ success: true, message: `Stock status updated for item ${itemId}` });
        }

        const menusResult = await query('SELECT id, config FROM menus WHERE user_id = $1', [restaurantId]);
        let updated = false;

        for (const menu of menusResult.rows) {
            let config = menu.config || {};
            let found = false;
            const dynamicSections = ['sizes', 'mealsOption', 'saucesOption', 'drinksOption', 'extrasOption', 'friesOption', 'categories', 'items'];

            for (const sectionKey of dynamicSections) {
                if (Array.isArray(config[sectionKey])) {
                    config[sectionKey] = config[sectionKey].map(item => {
                        const isObj = typeof item === 'object' && item !== null;
                        const matchId = isObj ? item.id : `${sectionKey}-${item}`;
                        if (String(matchId) === String(itemId)) {
                            found = true;
                            return isObj ? { ...item, is_available: isAvailable } : { name: item, is_available: isAvailable };
                        }
                        return item;
                    });
                }
            }

            if (found) {
                await query('UPDATE menus SET config = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(config), menu.id]);
                updated = true;
            }
        }

        if (updated) {
            return res.status(200).json({ success: true, message: `Stock status updated for item ${itemId} in dynamic menus` });
        }

        return res.status(404).json({ error: 'Item not found in any menu' });

    } catch (error) {
        console.error('Stock Sync Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

import { query } from './db.js';
import { validateApiKey } from './pos-adapters/auth-util.js';

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const apiKey = event.headers['x-api-key'] || event.headers['X-API-KEY'];
        const restaurantId = await validateApiKey(apiKey);

        if (!restaurantId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid API Key' }) };
        }

        const { itemId, isAvailable } = JSON.parse(event.body);

        if (itemId === undefined || isAvailable === undefined) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing itemId or isAvailable' }) };
        }

        // 1. Try to update generated_menu_items (for template/AI menus)
        const genResult = await query(
            'UPDATE generated_menu_items SET is_available = $1, updated_at = NOW() WHERE id = $2 AND menu_id IN (SELECT id FROM generated_menus WHERE user_id = $3) RETURNING id',
            [isAvailable, itemId, restaurantId]
        );

        if (genResult.rowCount > 0) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: `Stock status updated for item ${itemId}` })
            };
        }

        // 2. Try to update standard/dynamic menus table
        // We look for any menu belonging to this restaurant that mentions this item ID in its config
        const menusResult = await query('SELECT id, config FROM menus WHERE user_id = $1', [restaurantId]);
        let updated = false;

        for (const menu of menusResult.rows) {
            let config = menu.config || {};
            let found = false;

            // Same search logic as simulation script
            const dynamicSections = ['sizes', 'mealsOption', 'saucesOption', 'drinksOption', 'extrasOption', 'friesOption', 'categories', 'items'];

            for (const sectionKey of dynamicSections) {
                if (Array.isArray(config[sectionKey])) {
                    config[sectionKey] = config[sectionKey].map(item => {
                        const isObj = typeof item === 'object' && item !== null;
                        const matchId = isObj ? item.id : `${sectionKey}-${item}`;

                        if (String(matchId) === String(itemId)) {
                            found = true;
                            if (isObj) {
                                return { ...item, is_available: isAvailable };
                            } else {
                                return { name: item, is_available: isAvailable };
                            }
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
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: `Stock status updated for item ${itemId} in dynamic menus` })
            };
        }

        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found in any menu' }) };

    } catch (error) {
        console.error('Stock Sync Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};

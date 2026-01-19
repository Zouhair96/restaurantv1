import { query } from './db.js';
import jwt from 'jsonwebtoken';

const getUserFromToken = (headers) => {
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return null;
    }
};

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const user = getUserFromToken(event.headers);
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    try {
        const { itemId, isAvailable } = JSON.parse(event.body);
        const restaurantId = user.id;

        if (!itemId || isAvailable === undefined) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
        }

        // Verify integration is enabled
        const settingsResult = await query(
            'SELECT stock_enabled, stock_sync_url FROM integration_settings WHERE restaurant_id = $1',
            [restaurantId]
        );

        if (settingsResult.rows.length === 0 || !settingsResult.rows[0].stock_enabled) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Stock Integration is not enabled or configured" })
            };
        }

        // 1. Try to update generated_menu_items (for template/AI menus)
        const result = await query(
            'UPDATE generated_menu_items SET is_available = $1, updated_at = NOW() WHERE id = $2 AND menu_id IN (SELECT id FROM generated_menus WHERE user_id = $3) RETURNING *',
            [isAvailable, itemId, restaurantId]
        );

        if (result.rowCount > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Stock sync simulated successfully",
                    item: result.rows[0]
                })
            };
        }

        // 2. Try to update menus table (for Dynamic/Step-by-Step menus)
        // This is a bit tricky: we search for the item ID in the config JSONB
        // and update its is_available property if found.

        // Let's find all menus for this user
        const menusResult = await query('SELECT id, config FROM menus WHERE user_id = $1', [restaurantId]);

        for (const menu of menusResult.rows) {
            let config = menu.config || {};
            let found = false;

            // Search in dynamic sections
            const dynamicSections = ['sizes', 'mealsOption', 'saucesOption', 'drinksOption', 'extrasOption', 'friesOption', 'categories'];

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
                                // Convert string to object to store availability
                                return { name: item, is_available: isAvailable };
                            }
                        }
                        return item;
                    });
                }
            }

            if (found) {
                await query('UPDATE menus SET config = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(config), menu.id]);
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: "Dynamic menu stock updated",
                        item: { id: itemId, is_available: isAvailable }
                    })
                };
            }
        }

        return { statusCode: 404, body: JSON.stringify({ error: "Item not found in any menu" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

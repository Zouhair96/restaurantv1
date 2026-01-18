import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'DELETE') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { menuId, userId } = JSON.parse(event.body);

        if (!menuId || !userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Menu ID and User ID are required' }),
            };
        }

        // Verify ownership
        const [menu] = await sql`
            SELECT id FROM generated_menus
            WHERE id = ${menuId} AND user_id = ${userId}
        `;

        if (!menu) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Menu not found or unauthorized' }),
            };
        }

        // Delete menu (cascade will delete items)
        await sql`
            DELETE FROM generated_menus
            WHERE id = ${menuId}
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Menu deleted successfully',
            }),
        };
    } catch (error) {
        console.error('Error deleting menu:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to delete menu', details: error.message }),
        };
    }
};

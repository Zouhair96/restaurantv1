import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Verify JWT token
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized: Missing token' })
            };
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET missing");

        const decoded = jwt.verify(token, secret);
        const restaurantId = decoded.id;

        // Delete all visitor events for this restaurant
        const result = await query(
            'DELETE FROM visitor_events WHERE restaurant_id = $1',
            [restaurantId]
        );

        // ALSO delete from the new loyalty tables
        await query('DELETE FROM gifts WHERE restaurant_id = $1', [restaurantId]);
        await query('DELETE FROM points_transactions WHERE restaurant_id = $1', [restaurantId]);

        const visitorReset = await query(
            'DELETE FROM loyalty_visitors WHERE restaurant_id = $1',
            [restaurantId]
        );

        // Update the loyalty_config with a reset timestamp so clients know to wipe their local storage
        await query(
            `UPDATE users 
             SET loyalty_config = jsonb_set(
                 COALESCE(loyalty_config, '{}'::jsonb), 
                 '{last_reset_timestamp}', 
                 $1::jsonb
             ) 
             WHERE id = $2`,
            [Date.now(), restaurantId]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `Successfully reset loyalty data. Deleted ${result.rowCount} legacy events and ${visitorReset.rowCount} visitor records.`,
                deletedCount: result.rowCount,
                visitorsResetCount: visitorReset.rowCount
            })
        };

    } catch (error) {
        console.error('Reset Loyalty Data Error:', error);

        if (error.name === 'JsonWebTokenError') {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error',
                details: error.message
            })
        };
    }
};

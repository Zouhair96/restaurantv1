import { query } from './db.js';
import jwt from 'jsonwebtoken';

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
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

        const body = JSON.parse(event.body);
        const { starting_number, reset_period, weekly_start_day } = body;

        // Validation
        if (!starting_number || starting_number < 1) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Starting number must be at least 1' })
            };
        }

        const validPeriods = ['never', 'daily', 'weekly', 'monthly'];
        if (!validPeriods.includes(reset_period)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid reset period' })
            };
        }

        if (reset_period === 'weekly' && (weekly_start_day < 0 || weekly_start_day > 6)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Weekly start day must be 0-6' })
            };
        }

        // Get current config
        const currentResult = await query(
            'SELECT order_number_config FROM users WHERE id = $1',
            [restaurantId]
        );

        const currentConfig = currentResult.rows[0]?.order_number_config || {};

        // Update config while preserving current_number and last_reset_date
        const newConfig = {
            ...currentConfig,
            starting_number,
            reset_period,
            weekly_start_day: reset_period === 'weekly' ? weekly_start_day : 1,
            // Preserve current_number and last_reset_date
            current_number: currentConfig.current_number || starting_number,
            last_reset_date: currentConfig.last_reset_date || null
        };

        // Update database
        await query(
            'UPDATE users SET order_number_config = $1 WHERE id = $2',
            [JSON.stringify(newConfig), restaurantId]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Order numbering settings updated successfully',
                config: newConfig
            })
        };

    } catch (error) {
        console.error('Update Order Number Config Error:', error);

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

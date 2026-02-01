import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // --- Middleware: Ensure Schema is ready ---
        try {
            await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) DEFAULT 0").catch(() => { });
            await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'").catch(() => { });
            await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP").catch(() => { });
        } catch (dbErr) {
            console.warn('[DB Warning]: Could not ensure sales stats schema:', dbErr.message);
        }

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
        const restaurantId = decoded.restaurant_id;

        // Get sales for today
        const todayResult = await query(
            `SELECT COALESCE(SUM(total_price), 0) as total
             FROM orders
             WHERE restaurant_id = $1 
             AND status != 'cancelled'
             AND created_at >= CURRENT_DATE`,
            [restaurantId]
        );

        // Get sales for yesterday
        const yesterdayResult = await query(
            `SELECT COALESCE(SUM(total_price), 0) as total
             FROM orders
             WHERE restaurant_id = $1 
             AND status != 'cancelled'
             AND created_at >= CURRENT_DATE - INTERVAL '1 day'
             AND created_at < CURRENT_DATE`,
            [restaurantId]
        );

        // Get sales for the last 7 days (including today)
        const weeklyResult = await query(
            `SELECT 
                DATE(created_at) as date,
                COALESCE(SUM(total_price), 0) as daily_total
             FROM orders
             WHERE restaurant_id = $1 
             AND status != 'cancelled'
             AND created_at >= CURRENT_DATE - INTERVAL '6 days'
             GROUP BY DATE(created_at)
             ORDER BY DATE(created_at) ASC`,
            [restaurantId]
        );

        const todaySales = parseFloat(todayResult.rows[0].total);
        const yesterdaySales = parseFloat(yesterdayResult.rows[0].total);

        // Calculate growth percentage
        let growth = 0;
        if (yesterdaySales > 0) {
            growth = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
        } else if (todaySales > 0) {
            growth = 100; // 100% growth if yesterday was 0
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                todaySales,
                yesterdaySales,
                growth: parseFloat(growth.toFixed(1)),
                weeklyStats: weeklyResult.rows
            })
        };

    } catch (error) {
        console.error('Sales Stats Error:', error);

        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    error: 'Unauthorized',
                    details: error.message,
                    code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Sales statistics currently unavailable',
                details: error.message
            })
        };
    }
};

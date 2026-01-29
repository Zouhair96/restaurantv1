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
            // Split into separate queries for maximum compatibility
            const tableFixes = [
                "ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'",
                "ADD COLUMN IF NOT EXISTS loyalty_discount_applied BOOLEAN DEFAULT false",
                "ADD COLUMN IF NOT EXISTS loyalty_discount_amount NUMERIC DEFAULT 0",
                "ADD COLUMN IF NOT EXISTS loyalty_gift_item TEXT",
                "ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT"
            ];
            for (const fix of tableFixes) {
                await query(`ALTER TABLE orders ${fix}`).catch(e => console.warn(`[DB Patch] ${fix} failed:`, e.message));
            }
        } catch (dbErr) {
            console.warn('[DB Warning]: Could not ensure orders schema:', dbErr.message);
        }

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

        // Get orders for this restaurant (Simplified: removed driver and auto-accept fields)
        const result = await query(
            `SELECT id, order_type, table_number, delivery_address, payment_method, items, total_price, status, created_at, updated_at, payment_status, loyalty_discount_applied, loyalty_discount_amount, loyalty_gift_item
             FROM orders
             WHERE restaurant_id = $1
             ORDER BY created_at DESC`,
            [restaurantId]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                orders: result.rows
            })
        };

    } catch (error) {
        console.error(' [GET-ORDERS DEBUG] Full Error:', error);

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

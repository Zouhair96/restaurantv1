import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    // 1. JWT Authentication & OWNER Authorization
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token' }) };
    }

    // STRICT OWNER ONLY
    if (decoded.role !== 'OWNER' && decoded.role !== 'ADMIN') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Owners only' }) };
    }

    const ownerRestaurantId = decoded.restaurant_id;

    try {
        // --- GET STAFF LIST ---
        if (event.httpMethod === 'GET') {
            const result = await query(
                'SELECT id, name, role, is_active, created_at FROM users WHERE restaurant_id = $1 AND role = $2 ORDER BY created_at DESC',
                [ownerRestaurantId, 'STAFF']
            );
            return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
        }

        // --- CREATE STAFF ---
        if (event.httpMethod === 'POST') {
            const { name, pin } = JSON.parse(event.body);
            if (!name || !pin || pin.length !== 4) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name and 4-digit PIN required' }) };
            }

            // Check uniqueness of PIN within restaurant (Optional but recommended for unambiguous login)
            const existingStaff = await query(
                'SELECT id, pin_hash FROM users WHERE restaurant_id = $1 AND role = $2 AND is_active = true',
                [ownerRestaurantId, 'STAFF']
            );

            for (const staff of existingStaff.rows) {
                const isMatch = await bcrypt.compare(pin, staff.pin_hash);
                if (isMatch) {
                    return { statusCode: 409, headers, body: JSON.stringify({ error: 'This PIN is already in use by another staff member.' }) };
                }
            }

            const pinHash = await bcrypt.hash(pin, 10);

            // Staff members don't strictly need unique emails in some systems, 
            // but our current schema has a UNIQUE constraint on email.
            // WORKAROUND: Generate a dummy email for staff to satisfy the DB constraint
            const dummyEmail = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@internal.com`;

            const newUser = await query(
                'INSERT INTO users (name, email, password_hash, role, login_type, pin_hash, restaurant_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, role, is_active',
                [name, dummyEmail, 'INTERNAL_ONLY', 'STAFF', 'PIN', pinHash, ownerRestaurantId, true]
            );

            return { statusCode: 201, headers, body: JSON.stringify(newUser.rows[0]) };
        }

        // --- UPDATE STAFF STATUS (ENABLE/DISABLE) ---
        if (event.httpMethod === 'PATCH') {
            const { id, is_active } = JSON.parse(event.body);

            // SECURITY: Ensure target staff belongs to this owner's restaurant
            const check = await query('SELECT id FROM users WHERE id = $1 AND restaurant_id = $2', [id, ownerRestaurantId]);
            if (check.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Staff member not found in your restaurant' }) };
            }

            await query('UPDATE users SET is_active = $1 WHERE id = $2', [is_active, id]);
            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        // --- DELETE STAFF ---
        if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);

            // SECURITY: Ensure target staff belongs to this owner's restaurant
            const check = await query('SELECT id FROM users WHERE id = $1 AND restaurant_id = $2', [id, ownerRestaurantId]);
            if (check.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Staff member not found in your restaurant' }) };
            }

            await query('DELETE FROM users WHERE id = $1', [id]);
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Staff member removed' }) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    } catch (error) {
        console.error('Staff Management Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};

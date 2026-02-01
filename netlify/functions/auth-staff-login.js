import { query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
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
        const { pin, restaurant_id } = JSON.parse(event.body);

        if (!pin || !restaurant_id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'PIN and Restaurant ID are required' })
            };
        }

        // 1. Fetch all active staff for this restaurant
        const result = await query(
            'SELECT id, name, pin_hash, role, restaurant_id FROM users WHERE restaurant_id = $1 AND role = $2 AND is_active = true',
            [restaurant_id, 'STAFF']
        );

        if (result.rows.length === 0) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid PIN or Restaurant ID' })
            };
        }

        // 2. Find matching staff member by PIN
        let matchingStaff = null;
        for (const staff of result.rows) {
            const isMatch = await bcrypt.compare(pin, staff.pin_hash);
            if (isMatch) {
                matchingStaff = staff;
                break;
            }
        }

        if (!matchingStaff) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid PIN or Restaurant ID' })
            };
        }

        // 3. Create Token
        const token = jwt.sign(
            {
                id: matchingStaff.id,
                role: 'STAFF',
                restaurant_id: matchingStaff.restaurant_id,
                name: matchingStaff.name
            },
            JWT_SECRET,
            { expiresIn: '24h' } // Shorter session for staff security
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                token,
                user: {
                    id: matchingStaff.id,
                    name: matchingStaff.name,
                    role: 'STAFF',
                    restaurant_id: matchingStaff.restaurant_id
                }
            })
        };

    } catch (error) {
        console.error('Staff Login Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

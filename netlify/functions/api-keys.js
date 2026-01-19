import { query } from './db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

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

export const handler = async (event, context) => {
    const user = getUserFromToken(event.headers);
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    const restaurant_id = user.id;

    try {
        // GET: List all keys for this restaurant
        if (event.httpMethod === 'GET') {
            const result = await query(
                'SELECT id, key_name, last_used, created_at FROM restaurant_api_keys WHERE restaurant_id = $1 ORDER BY created_at DESC',
                [restaurant_id]
            );
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.rows)
            };
        }

        // POST: Generate a new key
        if (event.httpMethod === 'POST') {
            const { key_name } = JSON.parse(event.body);
            if (!key_name) {
                return { statusCode: 400, body: JSON.stringify({ error: "Key name is required" }) };
            }

            // Generate raw key
            const rawKey = 'digi_' + crypto.randomBytes(24).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const keyHash = await bcrypt.hash(rawKey, salt);

            const result = await query(
                'INSERT INTO restaurant_api_keys (restaurant_id, key_name, key_hash) VALUES ($1, $2, $3) RETURNING id, key_name, created_at',
                [restaurant_id, key_name, keyHash]
            );

            return {
                statusCode: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Key generated successfully. Copy it now, it won't be shown again!",
                    key: rawKey,
                    info: result.rows[0]
                })
            };
        }

        // DELETE: Revoke a key
        if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);
            if (!id) {
                return { statusCode: 400, body: JSON.stringify({ error: "Key ID is required" }) };
            }

            const result = await query(
                'DELETE FROM restaurant_api_keys WHERE id = $1 AND restaurant_id = $2 RETURNING id',
                [id, restaurant_id]
            );

            if (result.rowCount === 0) {
                return { statusCode: 404, body: JSON.stringify({ error: "Key not found or unauthorized" }) };
            }

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "Key revoked successfully" })
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (error) {
        console.error('API Keys Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

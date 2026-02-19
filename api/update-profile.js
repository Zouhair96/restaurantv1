import { query } from './db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server configuration error' });

        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;
        const { name, restaurantName, address, phoneNumber } = req.body;

        const result = await query(
            `UPDATE users 
             SET name = $1, restaurant_name = $2, address = $3, phone_number = $4 
             WHERE id = $5 
             RETURNING id, name, email, restaurant_name, address, phone_number, role, subscription_plan, subscription_status`,
            [name, restaurantName, address, phoneNumber, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ message: 'Profile updated successfully', user: result.rows[0] });

    } catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

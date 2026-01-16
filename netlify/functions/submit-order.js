import { query } from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event, context) => {
    // Allow CORS
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
        const { restaurantName, orderType, tableNumber, deliveryAddress, paymentMethod, items, totalPrice } = JSON.parse(event.body);

        // Optional: Get customer ID from token if present
        let customerId = null;
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.role === 'client') {
                    customerId = decoded.id;
                }
            } catch (err) {
                console.warn('Invalid token provided for order placement');
            }
        }

        // Validation
        if (!restaurantName || !orderType || !paymentMethod || !items || totalPrice === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        if (!['dine_in', 'take_out'].includes(orderType)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid order type' })
            };
        }

        if (!['credit_card', 'cash'].includes(paymentMethod)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid payment method' })
            };
        }

        if (orderType === 'dine_in' && !tableNumber) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Table number required for dine-in orders' })
            };
        }

        if (orderType === 'take_out' && !deliveryAddress) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Delivery address required for take-out orders' })
            };
        }

        // Find restaurant by name
        const restaurantResult = await query(
            'SELECT id FROM users WHERE restaurant_name = $1',
            [restaurantName]
        );

        if (restaurantResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Restaurant not found' })
            };
        }

        const restaurantId = restaurantResult.rows[0].id;

        // Insert order
        const orderResult = await query(
            `INSERT INTO orders (restaurant_id, order_type, table_number, delivery_address, payment_method, items, total_price, status, customer_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
             RETURNING id, created_at`,
            [restaurantId, orderType, tableNumber, deliveryAddress, paymentMethod, JSON.stringify(items), totalPrice, customerId]
        );

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                orderId: orderResult.rows[0].id,
                message: 'Order placed successfully'
            })
        };

    } catch (error) {
        console.error('Submit Order Error:', error);
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

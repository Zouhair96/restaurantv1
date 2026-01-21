import { query } from './db.js';
import jwt from 'jsonwebtoken';
import { POSManager } from './pos-adapters/pos-manager.js';

export const handler = async (event, context) => {
    // 1. Check Method
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // 2. Verify Token
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized: No token provided' })
            };
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        const restaurantId = decoded.id;

        const { pos_webhook_url, pos_api_key, pos_provider } = JSON.parse(event.body);

        if (!pos_webhook_url) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Webhook URL is required for testing' })
            };
        }

        // Create a dummy test order
        const dummyOrder = {
            id: 'TEST-' + Math.floor(Math.random() * 10000),
            restaurant_id: restaurantId,
            order_type: 'dine_in',
            table_number: 'T-99',
            payment_method: 'cash',
            items: [
                { name: '🔥 Connection Test Item', price: 0.00, quantity: 1 }
            ],
            total_price: 0,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        const testSettings = {
            pos_webhook_url,
            pos_api_key,
            pos_provider: pos_provider || 'custom',
            pos_enabled: true
        };

        console.log(`Testing POS Connection for restaurant ${restaurantId} to ${pos_webhook_url}`);

        const result = await POSManager.sendOrder(testSettings, dummyOrder);

        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'POS test order sent successfully!',
                    details: result.external_id ? `External ID: ${result.external_id}` : 'Payload delivered.'
                })
            };
        } else {
            return {
                statusCode: 502,
                body: JSON.stringify({
                    error: 'POS test failed',
                    details: result.error || 'The external server returned an error.'
                })
            };
        }

    } catch (error) {
        console.error('POS Test Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};

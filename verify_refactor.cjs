
const { query } = require('./netlify/functions/db');

async function verifyStates() {
    const restaurantId = 1; // "foody"
    const deviceId = 'verify-refactor-device-' + Date.now();

    console.log('--- START VERIFICATION ---');

    // 1. WELCOME
    console.log('\n[STATE: WELCOME]');
    let res = await fetchStatus(deviceId, restaurantId);
    console.log('API Response:', JSON.stringify(res, null, 2));

    // 2. GIFT_AVAILABLE
    console.log('\n[STATE: GIFT_AVAILABLE]');
    // Manually insert order and gift
    await query('INSERT INTO orders (restaurant_id, loyalty_id, total_price, status, order_type, payment_method, items) VALUES ($1, $2, 10, \'completed\', \'take_out\', \'cash\', \'[]\')', [restaurantId, deviceId]);
    await query('INSERT INTO gifts (restaurant_id, device_id, type, percentage_value, euro_value, status) VALUES ($1, $2, \'PERCENTAGE\', 10, 0, \'unused\')', [restaurantId, deviceId]);
    await query('UPDATE loyalty_visitors SET total_points = 0, visit_count = 1, orders_in_current_session = 1 WHERE device_id = $1', [deviceId]);

    res = await fetchStatus(deviceId, restaurantId);
    console.log('API Response:', JSON.stringify(res, null, 2));

    // 3. POINTS_PROGRESS
    console.log('\n[STATE: POINTS_PROGRESS]');
    // Consume the gift
    await query('UPDATE gifts SET status = \'consumed\' WHERE device_id = $1', [deviceId]);

    res = await fetchStatus(deviceId, restaurantId);
    console.log('API Response:', JSON.stringify(res, null, 2));

    console.log('--- END VERIFICATION ---');
}

async function fetchStatus(loyaltyId, restaurantId) {
    const { handler } = require('./netlify/functions/get-loyalty-status');
    const event = {
        httpMethod: 'GET',
        queryStringParameters: {
            loyaltyId,
            restaurantId
        }
    };
    const result = await handler(event);
    return JSON.parse(result.body);
}

// Mocking environment variables if needed
process.env.DATABASE_URL = "postgres://postgres.yvngmngbhmomkicmqpwy:pzz2j3H!c8C!G!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";

verifyStates().catch(console.error);

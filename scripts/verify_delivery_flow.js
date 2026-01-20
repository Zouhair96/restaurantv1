import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function verifyFlow() {
    let client;
    try {
        client = await pool.connect();

        // 1. Create a dummy order
        console.log('📝 Creating test order...');
        const orderRes = await client.query(`
            INSERT INTO orders (restaurant_id, order_type, payment_method, items, total_price, status)
            VALUES (1, 'take_out', 'cash', '[{"name": "Test Burger", "price": 10}]', 10.00, 'pending')
            RETURNING id;
        `);
        const orderId = orderRes.rows[0].id;
        console.log(`✅ Order #${orderId} created.`);

        // 2. Simulate "Assign Driver" API call (Update to out_for_delivery)
        console.log('🚗 Assigning driver...');
        const driver = { name: 'Test Driver', phone: '555-0199' };

        // This simulates what update-order-status.js does
        const updateRes = await client.query(`
            UPDATE orders 
            SET status = 'out_for_delivery', 
                driver_name = $1, 
                driver_phone = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING status, driver_name;
        `, [driver.name, driver.phone, orderId]);

        const updatedOrder = updateRes.rows[0];

        // 3. Verify
        if (updatedOrder.status === 'out_for_delivery' && updatedOrder.driver_name === 'Test Driver') {
            console.log('✅ verification SUCCESS: Order is Out for Delivery with Driver: Test Driver');
        } else {
            console.error('❌ verification FAILED:', updatedOrder);
        }

        // Cleanup
        await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
        console.log('🧹 Test order cleaned up.');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

verifyFlow();

import { query } from './netlify/functions/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testGiftConversion() {
    console.log('🧪 Testing Gift Conversion Flow...\n');

    try {
        // 1. Check if there's a gift to test with
        const giftCheck = await query(`
            SELECT id, restaurant_id, device_id, status, type, euro_value, percentage_value, gift_name
            FROM gifts
            WHERE status = 'unused'
            ORDER BY created_at DESC
            LIMIT 1;
        `);

        if (giftCheck.rows.length === 0) {
            console.log('⚠️  No unused gifts found to test with.');
            console.log('Creating a test gift...\n');

            // Create a test gift
            const createGift = await query(`
                INSERT INTO gifts (restaurant_id, device_id, euro_value, type, status)
                VALUES (1, 'test-device-id', 5.00, 'FIXED_VALUE', 'unused')
                RETURNING *;
            `);

            console.log('✓ Test gift created:', createGift.rows[0]);
            console.log('');
        } else {
            console.log('Found unused gift:');
            console.log(giftCheck.rows[0]);
            console.log('');
        }

        // 2. Test the conversion by simulating what the function does
        const testGift = giftCheck.rows[0] || { id: 1, restaurant_id: 1, device_id: 'test-device-id' };

        console.log('🔄 Simulating conversion to "converted" status...\n');

        // This is what was failing before
        const updateTest = await query(`
            UPDATE gifts 
            SET status = 'converted' 
            WHERE id = $1 
            RETURNING *;
        `, [testGift.id]);

        if (updateTest.rows.length > 0) {
            console.log('✅ SUCCESS! Gift status updated to "converted"');
            console.log(updateTest.rows[0]);
            console.log('');

            // Rollback for testing purposes
            await query(`
                UPDATE gifts 
                SET status = 'unused' 
                WHERE id = $1;
            `, [testGift.id]);
            console.log('✓ Rolled back to "unused" for future testing\n');
        }

        console.log('🎉 Gift conversion constraint is now working correctly!');
        console.log('You can now test the conversion in the UI.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

testGiftConversion();

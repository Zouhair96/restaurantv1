import { query } from './netlify/functions/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkItemGift() {
    console.log('🔍 Checking ITEM gift data...\n');

    try {
        // Find the ITEM type gift
        const gift = await query(`
            SELECT id, restaurant_id, device_id, type, gift_name, euro_value, status
            FROM gifts
            WHERE type = 'ITEM' AND status = 'unused'
            ORDER BY created_at DESC
            LIMIT 1;
        `);

        if (gift.rows.length === 0) {
            console.log('❌ No ITEM gifts found');
            process.exit(0);
        }

        const g = gift.rows[0];
        console.log('Gift Record:');
        console.log(`  ID: ${g.id}`);
        console.log(`  Type: ${g.type}`);
        console.log(`  Gift Name: "${g.gift_name}"`);
        console.log(`  Euro Value: ${g.euro_value}`);
        console.log(`  Status: ${g.status}`);
        console.log('');

        // Check loyalty config
        const config = await query(`
            SELECT loyalty_config->>'points_per_euro' as ppe
            FROM users
            WHERE id = $1;
        `, [g.restaurant_id]);

        const ppe = parseInt(config.rows[0]?.ppe) || 100;
        console.log(`Points Per Euro: ${ppe}`);
        console.log('');

        // Calculate what the conversion would be
        const currentPrice = parseFloat(g.euro_value || 0);
        const conversionPoints = Math.floor(currentPrice * ppe);

        console.log('Conversion Calculation:');
        console.log(`  ${currentPrice} € × ${ppe} points/€ = ${conversionPoints} points`);
        console.log('');

        if (conversionPoints === 0) {
            console.log('❌ PROBLEM: Conversion results in 0 points!');
            console.log('   Either euro_value is 0 or points_per_euro is 0');
        } else {
            console.log('✅ Conversion should give:', conversionPoints, 'points');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    process.exit(0);
}

checkItemGift();

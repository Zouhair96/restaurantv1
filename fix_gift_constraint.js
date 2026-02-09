import { query } from './netlify/functions/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixGiftConstraint() {
    console.log('🔍 Checking current gifts table constraint...\n');

    try {
        // Check current constraint
        const constraintCheck = await query(`
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint
            WHERE conrelid = 'gifts'::regclass
            AND conname = 'gifts_status_check';
        `);

        if (constraintCheck.rows.length > 0) {
            console.log('Current constraint:');
            console.log(constraintCheck.rows[0].definition);
            console.log('');
        } else {
            console.log('⚠️  No gifts_status_check constraint found!\n');
        }

        // Check current status values in use
        const statusValues = await query(`
            SELECT DISTINCT status, COUNT(*) as count
            FROM gifts
            GROUP BY status
            ORDER BY status;
        `);

        console.log('Current status values in gifts table:');
        statusValues.rows.forEach(row => {
            console.log(`  - ${row.status}: ${row.count} records`);
        });
        console.log('');

        // Fix the constraint
        console.log('🔧 Updating constraint to allow: unused, consumed, converted...\n');

        await query(`
            ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_status_check;
        `);
        console.log('✓ Old constraint dropped');

        await query(`
            ALTER TABLE gifts ADD CONSTRAINT gifts_status_check 
            CHECK (status IN ('unused', 'consumed', 'converted'));
        `);
        console.log('✓ New constraint added');

        // Verify the fix
        const verifyConstraint = await query(`
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint
            WHERE conrelid = 'gifts'::regclass
            AND conname = 'gifts_status_check';
        `);

        console.log('\n✅ Updated constraint:');
        console.log(verifyConstraint.rows[0].definition);
        console.log('\n🎉 Constraint fix completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

fixGiftConstraint();

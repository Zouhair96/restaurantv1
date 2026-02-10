import { query } from './netlify/functions/db.js';

async function addPizzaFunTemplate() {
    console.log('🍕 Adding PizzaFun template to database...');

    try {
        const result = await query(`
            INSERT INTO templates (
                name, 
                template_key, 
                icon, 
                allowed_plans, 
                config, 
                base_layout, 
                status, 
                created_at, 
                updated_at,
                description
            )
            VALUES (
                $1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, NOW(), NOW(), $8
            )
            ON CONFLICT (template_key) DO UPDATE SET
                name = EXCLUDED.name,
                icon = EXCLUDED.icon,
                allowed_plans = EXCLUDED.allowed_plans,
                description = EXCLUDED.description,
                updated_at = NOW()
            RETURNING *;
        `, [
            'Pizza Fun',
            'pizzaFun',
            '🎉',
            '["free", "starter", "pro", "enterprise"]',
            '{}',
            'grid',
            'active',
            'Fun and playful pizza menu with vibrant gradients and animations'
        ]);

        console.log('✅ Template added successfully!');
        console.log('Template Details:', result.rows[0]);

        // Verify
        const verify = await query('SELECT id, name, template_key, icon, status FROM templates WHERE template_key = $1', ['pizzaFun']);
        console.log('\n✅ Verification:', verify.rows[0]);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding template:', error);
        process.exit(1);
    }
}

addPizzaFunTemplate();

import { query } from './netlify/functions/db.js';

async function seed() {
    console.log("🌱 Seeding testemplate...");

    const insertSql = `
        INSERT INTO templates (name, template_key, icon, image_url, description, allowed_plans, base_layout)
        VALUES (
            'Test Template (Healthy)', 
            'testemplate', 
            '🥗', 
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000', 
            'Fresh & Healthy Food Display with Detail View', 
            '["pro", "enterprise"]',
            'list'
        )
        ON CONFLICT (template_key) DO UPDATE SET 
            allowed_plans = EXCLUDED.allowed_plans,
            image_url = EXCLUDED.image_url,
            description = EXCLUDED.description,
            base_layout = EXCLUDED.base_layout
        RETURNING *;
    `;

    try {
        const res = await query(insertSql);
        console.log("✅ Seeded template:", res.rows[0]);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();

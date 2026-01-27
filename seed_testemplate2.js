import { query } from './netlify/functions/db.js';

async function seed() {
    console.log("🌱 Seeding testemplate2...");

    const insertSql = `
        INSERT INTO templates (name, template_key, icon, image_url, description, allowed_plans, base_layout)
        VALUES (
            'Fast Food App', 
            'testemplate2', 
            '🍔', 
            'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1000', 
            'Modern Fast Food Application Style', 
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
        const result = await query(insertSql);
        console.log(`✅ Template seeded: ${result.rows[0].name}`);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seed();

import { query } from './netlify/functions/db.js';

async function seed() {
    console.log("🌱 Seeding default templates...");

    const insertSql = `
        INSERT INTO templates (name, template_key, icon, image_url, description, allowed_plans)
        VALUES (
            'Pizza Time', 
            'pizza1', 
            '🍕', 
            'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1000', 
            'Clean & Modern Pizza Display', 
            '["starter", "pro", "enterprise"]'
        )
        ON CONFLICT (template_key) DO UPDATE SET 
            allowed_plans = EXCLUDED.allowed_plans,
            image_url = EXCLUDED.image_url,
            description = EXCLUDED.description
        RETURNING *;
    `;

    try {
        const res = await query(insertSql);
        console.log("✅ Seeded template:", res.rows[0]);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
    }
}

seed();


import { query } from './netlify/functions/db.js';

async function seedTemplate3() {
    console.log("Seeding Template 3...");

    const templateKey = 'testemplate3';
    const name = 'Modern Sidebar';
    const status = 'active';
    const allowedPlans = JSON.stringify(['starter', 'pro', 'enterprise']);
    const config = JSON.stringify({
        themeColor: '#0ea5e9', // Sky Blue
        layout: 'sidebar',
        showIcons: true
    });

    try {
        // Upsert Template
        const res = await query(`
            INSERT INTO templates (template_key, name, status, allowed_plans, config)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (template_key) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                status = EXCLUDED.status,
                allowed_plans = EXCLUDED.allowed_plans,
                config = EXCLUDED.config
            RETURNING *;
        `, [templateKey, name, status, allowedPlans, config]);

        console.log(`✅ Template '${res.rows[0].name}' seeded successfully! ID: ${res.rows[0].id}`);

        const templateId = res.rows[0].id;

        // Seed some initial items for this template so it's not empty
        const items = [
            {
                name: "Signature Burger",
                description: "Juicy beef patty with special sauce, cheddar, and caramelized onions on brioche.",
                price: 12.99,
                category: "Burgers",
                image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
                sort_order: 1
            },
            {
                name: "Crispy Fries",
                description: "Double-fried potatoes with sea salt and rosemary.",
                price: 4.99,
                category: "Sides",
                image_url: "https://images.unsplash.com/photo-1541592103048-4e2cacc9d048",
                sort_order: 2
            },
            {
                name: "Truffle Pasta",
                description: "Handmade tagliatelle with black truffle cream sauce.",
                price: 18.50,
                category: "Pasta",
                image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
                sort_order: 3
            },
            {
                name: "Caesar Salad",
                description: "Crisp romaine, parmesan crisps, house dressing.",
                price: 9.99,
                category: "Salads",
                image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9",
                sort_order: 4
            }
        ];

        console.log("Seeding default items for template...");
        for (const item of items) {
            await query(`
                INSERT INTO template_items (template_id, name, description, price, category, image_url, sort_order)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT DO NOTHING
            `, [templateId, item.name, item.description, item.price, item.category, item.image_url, item.sort_order]);
        }
        console.log("✅ Items seeded.");

    } catch (err) {
        console.error("❌ Seeding failed:", err);
    }
}

seedTemplate3();

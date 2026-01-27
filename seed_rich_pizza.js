import { query } from './netlify/functions/db.js';

async function seed() {
    console.log("🌱 Seeding Rich Pizza Template Data...");

    // 1. Get Template ID
    const res = await query("SELECT id FROM templates WHERE template_key = 'pizza1'");
    if (res.rows.length === 0) {
        console.error("❌ 'pizza1' template not found!");
        return;
    }
    const templateId = res.rows[0].id;

    // 2. Clear existing items
    await query("DELETE FROM template_items WHERE template_id = $1", [templateId]);

    // 3. Insert Rich Items
    const items = [
        {
            name: 'Royal Truffle',
            description: 'Black truffle cream, fior di latte, fresh mushrooms, truffle oil, parmesan shavings. An exquisite experience.',
            price: 18.50,
            image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000',
            category: 'Premium',
            sort_order: 1
        },
        {
            name: 'Spicy Diavola',
            description: 'San Marzano tomato sauce, mozzarella, spicy pepperoni, fresh basil, chili flakes.',
            price: 14.90,
            image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000',
            category: 'Classic',
            sort_order: 2
        },
        {
            name: 'Burrata & Pesto',
            description: 'Fresh basil pesto base, cherry tomatoes, whole burrata cheese added after cooking, toasted pine nuts.',
            price: 16.90,
            image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000',
            category: 'Premium',
            sort_order: 3
        },
        {
            name: 'Four Cheese',
            description: 'Cream base, gorgonzola, mozzarella, parmesan, smoked scamorza. Rich and creamy.',
            price: 13.50,
            image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000',
            category: 'Classic',
            sort_order: 4
        },
        {
            name: 'Veggie Garden',
            description: 'Tomato sauce, grilled zucchini, eggplant, bell peppers, red onion, oregan. Vegan friendly.',
            price: 12.90,
            image_url: 'https://images.unsplash.com/photo-1571407921558-a929dd57b54a?q=80&w=1000',
            category: 'Classic',
            sort_order: 5
        },
        {
            name: 'Nutella Dream',
            description: 'Pizza crust filled with Nutella, topped with crushed hazelnuts and powdered sugar.',
            price: 8.90,
            image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000',
            category: 'Desserts',
            sort_order: 6
        }
    ];

    for (const item of items) {
        await query(
            `INSERT INTO template_items (template_id, name, description, price, image_url, category, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [templateId, item.name, item.description, item.price, item.image_url, item.category, item.sort_order]
        );
    }

    console.log(`✅ Seeded ${items.length} items successfully.`);
}

seed();

import { query } from './netlify/functions/db.js';

async function seed() {
    console.log("🌱 Seeding Testemplate2 Items...");

    // 1. Get Template ID
    const res = await query("SELECT id FROM templates WHERE template_key = 'testemplate2'");
    if (res.rows.length === 0) {
        console.error("❌ 'testemplate2' template not found! Run seed_testemplate2.js first.");
        return;
    }
    const templateId = res.rows[0].id;

    // 2. Clear existing items
    await query("DELETE FROM template_items WHERE template_id = $1", [templateId]);

    // 3. Insert Items
    const items = [
        {
            name: 'Double Cheeseburger',
            description: 'Two beef patties, cheddar cheese, lettuce, tomato, pickles, and special sauce.',
            price: 12.50,
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000',
            category: 'Burgers',
            sort_order: 1
        },
        {
            name: 'Spicy Chicken Wings',
            description: '6 pieces of crispy chicken wings tossed in spicy buffalo sauce.',
            price: 8.90,
            image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1000',
            category: 'Chicken',
            sort_order: 2
        },
        {
            name: 'Pepperoni Pizza',
            description: 'Classic pepperoni pizza with mozzarella cheese and tomato sauce.',
            price: 14.00,
            image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000',
            category: 'Pizza',
            sort_order: 3
        },
        {
            name: 'French Fries',
            description: 'Crispy golden french fries with sea salt.',
            price: 3.50,
            image_url: 'https://images.unsplash.com/photo-1573080496987-aeb7d53385c7?q=80&w=1000',
            category: 'Sides',
            sort_order: 4
        },
        {
            name: 'Chicken Burger',
            description: 'Crispy chicken breast with lettuce and mayo on a sesame bun.',
            price: 10.50,
            image_url: 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?q=80&w=1000',
            category: 'Burgers',
            sort_order: 5
        },
        {
            name: 'Cola Zero',
            description: 'Refreshing sugar-free cola drink.',
            price: 2.00,
            image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000',
            category: 'Drinks',
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

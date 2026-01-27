import { query } from './netlify/functions/db.js';

async function seed() {
    console.log("🌱 Seeding Testemplate Items...");

    // 1. Get Template ID
    const res = await query("SELECT id FROM templates WHERE template_key = 'testemplate'");
    if (res.rows.length === 0) {
        console.error("❌ 'testemplate' template not found! Run seed_testemplate.js first.");
        return;
    }
    const templateId = res.rows[0].id;

    // 2. Clear existing items
    await query("DELETE FROM template_items WHERE template_id = $1", [templateId]);

    // 3. Insert Items
    const items = [
        {
            name: 'Avocado Salad',
            description: 'Fresh avocado with mixed greens, cherry tomatoes, and balsamic vinaigrette. A healthy choice.',
            price: 12.00,
            image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000',
            category: 'Food',
            sort_order: 1
        },
        {
            name: 'Royal Burger',
            description: 'Juicy beef burger with cheese, lettuce, tomato, and secret sauce on a brioche bun.',
            price: 14.50,
            image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000',
            category: 'Food',
            sort_order: 2
        },
        {
            name: 'Fruits Salad',
            description: 'Mix of seasonal fruits including berries, melon, and pineapple. Served with mint.',
            price: 9.50,
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000',
            category: 'Fruits',
            sort_order: 3
        },
        {
            name: 'Vegetable Mix',
            description: 'Steamed seasonal vegetables including broccoli, carrots, and cauliflower.',
            price: 10.00,
            image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000',
            category: 'Vegetables',
            sort_order: 4
        },
        {
            name: 'Organic Milk',
            description: 'Fresh organic whole milk, 1L bottle.',
            price: 3.50,
            image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=1000',
            category: 'Grocery',
            sort_order: 5
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

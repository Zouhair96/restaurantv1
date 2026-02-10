import { query } from './netlify/functions/db.js';
import fs from 'fs';

async function addPizzaFunItems() {
    console.log('🍕 Adding PizzaFun items to database...');

    try {
        // Read the SQL content properly
        // For simplicity in this script, I'll copy the SQL logic into JS query directly since 'DO $$' blocks might be tricky with simple query execution if params are complex, 
        // but let's try reading the file or just implementing the logic in JS.
        // Implementing logic in JS for better error handling and param support.

        // 1. Get Template ID
        const templateRes = await query("SELECT id FROM templates WHERE template_key = $1", ['pizzaFun']);
        if (templateRes.rows.length === 0) {
            console.error('❌ Template "pizzaFun" not found! Run add_template.js first.');
            process.exit(1);
        }
        const templateId = templateRes.rows[0].id;
        console.log(`✅ Found Template ID: ${templateId}`);

        // 2. Clear existing items
        await query("DELETE FROM template_items WHERE template_id = $1", [templateId]);
        console.log('🗑️ Cleared existing items');

        // 3. Insert New Items
        const items = [
            // Classic
            { name: 'Marinara DOP', description: 'Blended San Marzano tomatoes, piennolo tomato, oregano, garlic', price: 9.90, image: '/pizzas/sicilienne.png', category: 'Classic', sort: 1 },
            { name: 'Margherita', description: 'Blended San Marzano tomatoes, fior di latte, basil, pecorino gran cru', price: 10.90, image: '/pizzas/chevre.png', category: 'Classic', sort: 2 },
            { name: 'Funghi', description: 'Blended San Marzano tomatoes, fior di latte, mushrooms, basil, pecorino', price: 11.90, image: '/pizzas/calzone.png', category: 'Classic', sort: 3 },
            { name: 'Diavola', description: 'Blended San Marzano tomatoes, fior di latte, Calabrese soppressata, basil', price: 13.90, image: '/pizzas/mexicaine.png', category: 'Classic', sort: 4 },
            { name: 'Sicilienne', description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois', price: 11.90, image: '/pizzas/sicilienne.png', category: 'Classic', sort: 5 },
            { name: 'Calzone', description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf', price: 11.90, image: '/pizzas/calzone.png', category: 'Classic', sort: 6 },
            { name: 'Pêcheur', description: 'Sauce tomate, fromage, thon, saumon, olives, oignon', price: 12.90, image: '/pizzas/pecheur.png', category: 'Classic', sort: 7 },
            { name: '4 Fromages', description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', price: 12.90, image: '/pizzas/4fromages.png', category: 'Classic', sort: 8 },
            { name: 'Mexicaine', description: 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon', price: 14.90, image: '/pizzas/mexicaine.png', category: 'Classic', sort: 9 },

            // Premium
            { name: 'Bufalaina', description: 'Blended San Marzano tomatoes, mozzarella di bufala, basil, pecorino gran cru', price: 13.90, image: '/pizzas/4fromages.png', category: 'Premium', sort: 10 },
            { name: 'Salsiccia', description: 'Blended San Marzano tomatoes, fior di latte, sausage, basil, pecorino gran cru', price: 13.90, image: '/pizzas/mexicaine.png', category: 'Premium', sort: 11 },
            { name: 'Funghi e Salsiccia', description: 'Blended San Marzano tomatoes, fior di latte, mushrooms, sausage, basil, pecorino gran cru', price: 14.90, image: '/pizzas/calzone.png', category: 'Premium', sort: 12 },
            { name: 'Chèvre', description: 'Crème fraîche, fromage, chèvre, olives, oignon', price: 13.90, image: '/pizzas/chevre.png', category: 'Premium', sort: 13 },
            { name: 'Chicken', description: 'Crème fraîche, fromage, poulet fumé, champignons', price: 13.90, image: '/pizzas/4fromages.png', category: 'Premium', sort: 14 },

            // Special
            { name: 'Puttanesca', description: 'Blended San Marzano tomatoes, fior di latte, anchovies, black olives, capers, tomatoes, parmigiano reggiano', price: 12.90, image: '/pizzas/sicilienne.png', category: 'Special', sort: 15 },
            { name: 'Capricciosa', description: 'Blended San Marzano tomatoes, fior di latte, prosciutto cotto, mushrooms, black olives, artichokes', price: 14.90, image: '/pizzas/pecheur.png', category: 'Special', sort: 16 },
            { name: 'Bolognaise', description: 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni', price: 17.90, image: '/pizzas/mexicaine.png', category: 'Special', sort: 17 },

            // Drinks/Desserts
            { name: 'Coca-Cola', description: '33cl can chilled', price: 2.50, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop', category: 'Drinks', sort: 18 },
            { name: 'Tiramisu', description: 'Homemade italian classic', price: 5.90, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop', category: 'Desserts', sort: 19 }
        ];

        for (const item of items) {
            await query(`
                INSERT INTO template_items (template_id, name, description, price, image_url, category, sort_order, is_deleted)
                VALUES ($1, $2, $3, $4, $5, $6, $7, false)
            `, [templateId, item.name, item.description, item.price, item.image, item.category, item.sort]);
        }

        console.log(`✅ Successfully added ${items.length} items to database!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding items:', error);
        process.exit(1);
    }
}

addPizzaFunItems();

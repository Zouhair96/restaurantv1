import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection (Using same logic as init-db.js)
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_EML9WVupUz5t@ep-weathered-glade-ae8e9csk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const isLocal = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || FALLBACK_DB_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

const newItems = [
    { id: 1, name: 'Sicilienne', description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois', price: 11.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: '/pizzas/sicilienne.png' },
    { id: 2, name: 'Calzone', description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf', price: 11.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: '/pizzas/calzone.png' },
    { id: 3, name: 'Pêcheur', description: 'Sauce tomate, fromage, thon, saumon, olives, oignon', price: 12.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: '/pizzas/pecheur.png' },
    { id: 4, name: '4 Fromages', description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', price: 12.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: '/pizzas/4fromages.png' },
    { id: 5, name: 'Mexicaine', description: 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon', price: 14.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: '/pizzas/mexicaine.png' },
    { id: 6, name: 'Chèvre', description: 'Crème fraîche, fromage, chèvre, olives, oignon', price: 13.90, category: 'Premium', categoryColor: 'bg-purple-100 text-purple-800', image: '/pizzas/chevre.png' },
    { id: 7, name: 'Chicken', description: 'Crème fraîche, fromage, poulet fumé, champignons', price: 13.90, category: 'Premium', categoryColor: 'bg-purple-100 text-purple-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
    { id: 8, name: 'Bolognaise', description: 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni', price: 17.90, category: 'Special', categoryColor: 'bg-orange-100 text-orange-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
];

async function seedMenu() {
    try {
        console.log('🍕 Seeding Pizza Menu...');

        // Check if menu exists
        const result = await pool.query("SELECT * FROM menus WHERE name = 'Pizza Menu'");

        if (result.rows.length === 0) {
            console.log('No "Pizza Menu" found. Creating one for the first user found...');
            const userRes = await pool.query("SELECT id FROM users LIMIT 1");
            if (userRes.rows.length === 0) {
                console.error("No users found to assign menu to!");
                return;
            }
            const userId = userRes.rows[0].id;
            await pool.query(
                'INSERT INTO menus (user_id, name, template_type, config) VALUES ($1, $2, $3, $4)',
                [userId, 'Pizza Menu', 'custom', JSON.stringify({ items: newItems })]
            );
            console.log('✅ Created new "Pizza Menu"');
        } else {
            // Update ALL instances of "Pizza Menu" (in case multiple users have one)
            console.log(`Found ${result.rows.length} existing "Pizza Menu"(s). Updating...`);
            await pool.query(
                "UPDATE menus SET config = $1 WHERE name = 'Pizza Menu'",
                [JSON.stringify({ items: newItems })]
            );
            console.log('✅ Updated existing "Pizza Menu"(s) with new items/images');
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seedMenu();

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = "postgresql://neondb_owner:npg_EML9WVupUz5t@ep-weathered-glade-ae8e9csk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("Creating template_items table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS template_items (
                id SERIAL PRIMARY KEY,
                template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
                category TEXT,
                name TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10, 2),
                image_url TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Creating item_overrides table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS item_overrides (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                template_item_id INTEGER REFERENCES template_items(id) ON DELETE CASCADE,
                name_override TEXT,
                description_override TEXT,
                price_override DECIMAL(10, 2),
                image_override TEXT,
                is_hidden BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(restaurant_id, template_item_id)
            );
        `);

        // Migration from existing templates.config to template_items
        console.log("Migrating current blueprint data to template_items...");
        const templatesRes = await client.query("SELECT id, config FROM templates WHERE config->'items' IS NOT NULL");
        for (const template of templatesRes.rows) {
            const items = template.config.items;
            if (Array.isArray(items)) {
                for (const item of items) {
                    await client.query(
                        "INSERT INTO template_items (template_id, name, description, price, image_url, category) VALUES ($1, $2, $3, $4, $5, $6)",
                        [template.id, item.name, item.description, item.price, item.image || item.image_url, item.category]
                    );
                }
            }
            // Clear items from config to avoid confusion, but keep other config
            const newConfig = { ...template.config };
            delete newConfig.items;
            await client.query("UPDATE templates SET config = $1 WHERE id = $2", [newConfig, template.id]);
        }

        await client.query('COMMIT');
        console.log("Migration completed successfully.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration failed:", e.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();

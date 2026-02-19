import { query } from './db.js';

export default async function handler(req, res) {
    try {
        console.log('Migrating points and session schema...');
        await query(`
            CREATE TABLE IF NOT EXISTS points_transactions (
                id SERIAL PRIMARY KEY,
                restaurant_id INT REFERENCES users(id),
                customer_id INT REFERENCES users(id),
                points_delta INT NOT NULL,
                reason TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await query(`
            CREATE TABLE IF NOT EXISTS loyalty_visitors (
                id SERIAL PRIMARY KEY,
                restaurant_id INT REFERENCES users(id),
                visitor_uuid TEXT,
                visit_count INT DEFAULT 1,
                total_spent DECIMAL(10,2) DEFAULT 0,
                last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(restaurant_id, visitor_uuid)
            )
        `);
        return res.status(200).json({ success: true, message: 'Points & Session schema migrated' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

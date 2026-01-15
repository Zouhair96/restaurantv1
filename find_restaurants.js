import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function findRestaurants() {
    try {
        const res = await pool.query('SELECT restaurant_name FROM users WHERE restaurant_name IS NOT NULL');
        console.log('Restaurants:', res.rows.map(r => r.restaurant_name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findRestaurants();

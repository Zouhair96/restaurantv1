import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function findHodhod() {
    try {
        const res = await pool.query(`
      SELECT m.config 
      FROM users u 
      JOIN menus m ON u.id = m.user_id 
      WHERE u.restaurant_name = 'hodhod'
    `);
        if (res.rows.length > 0) {
            console.log(JSON.stringify(res.rows[0].config, null, 2));
        } else {
            console.log('No hodhod found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findHodhod();

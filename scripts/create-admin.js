import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createAdmin() {
    const name = 'admin';
    const email = 'admin@gmail.com';
    const password = 'admin123';
    const role = 'admin';

    try {
        console.log('Checking if admin user exists...');
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (check.rows.length > 0) {
            console.log('Admin user already exists. Updating role to admin...');
            await pool.query('UPDATE users SET role = $1 WHERE email = $2', [role, email]);
            console.log('Role updated successfully.');
            return;
        }

        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        console.log('Inserting admin user...');
        await pool.query(
            'INSERT INTO users (name, email, password_hash, role, restaurant_name) VALUES ($1, $2, $3, $4, $5)',
            [name, email, passwordHash, role, 'Admin Central']
        );
        console.log('Admin user created successfully!');

    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        await pool.end();
    }
}

createAdmin();

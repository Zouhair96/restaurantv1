import { query } from './netlify/functions/db.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    const email = 'admin@gmail.com';
    const password = 'azerty123';
    const name = 'Admin User';

    try {
        console.log(`Creating admin user: ${email}`);

        // 1. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. Insert User
        // Using ON CONFLICT to handle if it already exists (updating password/role just in case)
        const text = `
            INSERT INTO users (
                name, 
                email, 
                password_hash, 
                role, 
                subscription_plan, 
                subscription_status
            ) 
            VALUES ($1, $2, $3, 'admin', 'enterprise', 'active')
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = $3, 
                role = 'admin',
                subscription_plan = 'enterprise',
                subscription_status = 'active'
            RETURNING id, name, email, role;
        `;

        const res = await query(text, [name, email, passwordHash]);
        console.log('✅ Admin user created/updated successfully:', res.rows[0]);

    } catch (err) {
        console.error('❌ Failed to create admin user:', err);
    }
}

createAdmin();

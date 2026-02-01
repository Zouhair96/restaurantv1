import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
};

async function generateMigrationReport() {
    const client = new Client(config);
    try {
        await client.connect();

        console.log('\n--- USER ROLE MIGRATION AUDIT REPORT ---');
        console.log('Generating mapping for review...\n');

        const res = await client.query('SELECT id, name, email, role, restaurant_name FROM users ORDER BY role DESC');
        const users = res.rows;

        const report = users.map(user => {
            let proposedRole = 'OWNER'; // Default for non-admins
            if (user.role === 'admin') {
                proposedRole = 'ADMIN';
            }

            return {
                id: user.id,
                email: user.email,
                current: user.role,
                proposed: proposedRole
            };
        });

        console.table(report);

        console.log('\n--- RECOMMENDATION ---');
        console.log('1. Review specific roles.');
        console.log('2. Ensure no STAFF roles are needed for existing users (they usually use emails).');
        console.log('3. ADMIN roles will map to the new ADMIN status.\n');

    } catch (err) {
        console.error('Migration Audit Failed:', err.message);
    } finally {
        await client.end();
    }
}

generateMigrationReport();

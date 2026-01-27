import { query } from './netlify/functions/db.js';

async function diagnose() {
    console.log("🔍 Starting Diagnosis...");

    try {
        // 1. Get Admin User
        console.log("\n1. Fetching Admin User...");
        const userRes = await query("SELECT id, role, subscription_plan FROM users WHERE email = 'admin@gmail.com'");
        if (userRes.rows.length === 0) {
            console.error("❌ Admin user not found! run create_admin.js");
            return;
        }
        const user = userRes.rows[0];
        console.log("✅ User found:", user);

        // 2. Simulate templates.js logic
        console.log("\n2. Testing Templates Query...");
        const templateSql = `
            SELECT * FROM templates 
            WHERE status = $1 
            AND allowed_plans ? $2
        `;
        // Assuming 'enterprise' plan for admin
        const plan = user.subscription_plan || 'starter';

        try {
            const templates = await query(templateSql, ['active', plan]);
            console.log(`✅ Templates Query Success. Found ${templates.rows.length} templates.`);
            if (templates.rows.length === 0) {
                console.warn("⚠️ No templates found. Table might be empty.");
            }
        } catch (err) {
            console.error("❌ Templates Query FAILED:", err.message);
        }

        // 3. Simulate menus.js logic
        console.log("\n3. Testing Menus Query...");
        const menuSql = `
            SELECT m.* 
            FROM menus m
            JOIN templates t ON m.template_type = t.template_key
            WHERE m.user_id = $1 
            AND (t.allowed_plans ? $2 OR $3 = 'admin')
            ORDER BY m.updated_at DESC
        `;

        try {
            const menus = await query(menuSql, [user.id, plan, user.role]);
            console.log(`✅ Menus Query Success. Found ${menus.rows.length} menus.`);
        } catch (err) {
            console.error("❌ Menus Query FAILED:", err.message);
        }

    } catch (err) {
        console.error("❌ GLOBAL ERROR:", err);
    }
}

diagnose();

import { query } from './netlify/functions/db.js';

async function check() {
    console.log("🔍 Checking Template Visibility...");

    // 1. Check if template exists
    const res = await query("SELECT id, name, template_key, allowed_plans FROM templates WHERE template_key = 'testemplate2'");
    if (res.rows.length === 0) {
        console.error("❌ 'testemplate2' NOT FOUND in database.");
    } else {
        console.log("✅ 'testemplate2' found:", res.rows[0]);
    }

    // 2. List all templates
    const all = await query("SELECT name, template_key, allowed_plans FROM templates");
    console.log("\n📋 All Templates:");
    all.rows.forEach(t => console.log(`- ${t.name} (${t.template_key}): ${JSON.stringify(t.allowed_plans)}`));
}

check();

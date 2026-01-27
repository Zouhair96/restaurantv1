import { query } from './netlify/functions/db.js';

async function checkTemplates() {
    console.log("🔍 Checking Templates Table...");
    try {
        const res = await query("SELECT * FROM templates");
        console.log(`✅ Found ${res.rows.length} templates:`);
        res.rows.forEach(t => {
            console.log(`- [${t.id}] ${t.name} (Key: ${t.template_key}) | Status: ${t.status} | Plans: ${JSON.stringify(t.allowed_plans)}`);
        });

        if (res.rows.length === 0) {
            console.warn("⚠️ Templates table is empty! Seeding failed?");
        }
    } catch (err) {
        console.error("❌ Error checking templates:", err);
    }
}

checkTemplates();

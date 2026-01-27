
import { query } from './netlify/functions/db.js';

async function updateTemplateColor() {
    console.log("Updating Template 3 Color...");

    try {
        // Update config to use Orange
        // We use jsonb_set to specific keys if possible, or just replace the config object if we know the structure.
        // Let's just update the specific key 'themeColor'

        const res = await query(`
            UPDATE templates 
            SET config = jsonb_set(config, '{themeColor}', '"#f97316"', true)
            WHERE template_key = 'testemplate3'
            RETURNING *;
        `);

        if (res.rows.length > 0) {
            console.log(`✅ Template '${res.rows[0].name}' updated. Config:`, res.rows[0].config);
        } else {
            console.log("⚠️ Template not found.");
        }

        // Also update any existing menus using this template to sync the color
        await query(`
            UPDATE menus
            SET config = jsonb_set(config, '{themeColor}', '"#f97316"', true)
            WHERE template_type = 'testemplate3'
       `);
        console.log("✅ Synced active menus.");

    } catch (err) {
        console.error("❌ Update failed:", err);
    }
}

updateTemplateColor();

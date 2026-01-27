
import { query } from './netlify/functions/db.js';

async function deleteTemplate3() {
    console.log("Deleting Template 3...");

    try {
        const templateKey = 'testemplate3';

        // Delete from templates table. FK constraints should handle cascading if set up correctly,
        // but let's be safe and delete related data first if needed, or rely on cascade.
        // Checking schema, usually there's ON DELETE CASCADE.

        // Delete template (and let cascade handle items and restaurant associations)
        const res = await query(`
            DELETE FROM templates 
            WHERE template_key = $1
            RETURNING *;
        `, [templateKey]);

        if (res.rows.length > 0) {
            console.log(`✅ Template '${res.rows[0].name}' deleted successfully.`);
        } else {
            console.log("⚠️ Template not found or already deleted.");
        }

    } catch (err) {
        console.error("❌ Deletion failed:", err);
    }
}

deleteTemplate3();

const { Pool } = require('pg');

// HARDCODED CONNECTION STRING FOR DEMO
// Note: In a real production app, this should be an Environment Variable.
const connectionString = "postgresql://neondb_owner:npg_1rpb6OTNdnDR@ep-solitary-meadow-aebg6bqq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};

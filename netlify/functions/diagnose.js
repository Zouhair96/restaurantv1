exports.handler = async (event, context) => {
    const results = {
        pg: 'pending',
        bcrypt: 'pending',
        jsonwebtoken: 'pending',
        db_file: 'pending',
        env_vars: 'pending'
    };

    try {
        require('pg');
        results.pg = 'OK';
    } catch (e) {
        results.pg = 'FAIL: ' + e.message;
    }

    try {
        require('bcryptjs');
        results.bcrypt = 'OK';
    } catch (e) {
        results.bcrypt = 'FAIL: ' + e.message;
    }

    try {
        require('jsonwebtoken');
        results.jsonwebtoken = 'OK';
    } catch (e) {
        results.jsonwebtoken = 'FAIL: ' + e.message;
    }

    try {
        require('./db');
        results.db_file = 'OK';
    } catch (e) {
        results.db_file = 'FAIL: ' + e.message;
    }

    results.env_vars = {
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        JWT_SECRET_SET: !!process.env.JWT_SECRET
    };

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results, null, 2)
    };
};

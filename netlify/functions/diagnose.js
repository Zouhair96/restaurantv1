import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db.js';

export const handler = async (event, context) => {
    const results = {
        pg: 'pending',
        bcrypt: 'pending',
        jsonwebtoken: 'pending',
        db_file: 'pending',
        env_vars: 'pending'
    };

    // Since imports are static in ESM, if we are running this code, imports largely succeeded.
    // However, we can check basic functionality.

    try {
        results.pg = pg ? 'OK' : 'FAIL';
    } catch (e) {
        results.pg = 'FAIL: ' + e.message;
    }

    try {
        results.bcrypt = bcrypt ? 'OK' : 'FAIL';
    } catch (e) {
        results.bcrypt = 'FAIL: ' + e.message;
    }

    try {
        results.jsonwebtoken = jwt ? 'OK' : 'FAIL';
    } catch (e) {
        results.jsonwebtoken = 'FAIL: ' + e.message;
    }

    try {
        results.db_file = db ? 'OK' : 'FAIL';
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

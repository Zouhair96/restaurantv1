import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db.js';

export default async function handler(req, res) {
    const results = {
        pg: pg ? 'OK' : 'FAIL',
        bcrypt: bcrypt ? 'OK' : 'FAIL',
        jsonwebtoken: jwt ? 'OK' : 'FAIL',
        db_file: db ? 'OK' : 'FAIL',
        env_vars: {
            DATABASE_URL_SET: !!process.env.DATABASE_URL,
            JWT_SECRET_SET: !!process.env.JWT_SECRET
        }
    };

    return res.status(200).json(results);
}

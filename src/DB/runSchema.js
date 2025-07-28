import path from 'path';
import fs from 'fs/promises';
import { pool } from './index.js';

async function runSchema() {
    try {
        const schemaPath = path.resolve('src/Models/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        const statements = schema.split(';').map(s => s.trim()).filter(Boolean);

        for (const stmt of statements) {
            await pool.query(stmt);
        }
        console.log('Schema applied successfully!');
    } catch (err) {
        console.error('Error applying schema:', err);
        process.exit(1);
    }
}

export { runSchema }
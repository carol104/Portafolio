import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {importPortfolio, DataTransferError} from '../server/data-transfer.js';

if (!process.env.DATABASE_URL || !process.argv[2]) throw new Error('Configura DATABASE_URL en .env.migration e indica el archivo de respaldo.');
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000});
try {
  const result = await importPortfolio(pool, JSON.parse(await readFile(process.argv[2], 'utf8')));
  console.log(JSON.stringify({imported: true, ...result}));
} catch (error) {
  console.error('Importación cancelada:', error instanceof DataTransferError ? error.message : error.code || error.name);
  process.exitCode = 1;
} finally { await pool.end(); }

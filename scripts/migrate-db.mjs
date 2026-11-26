import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {createContentStore} from '../server/content-store.js';

if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL en un archivo de entorno local.');
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000});
try {
  await pool.query(await readFile(new URL('../server/schema.sql', import.meta.url), 'utf8'));
  await createContentStore(pool).initialize();
  console.log('Esquema y migraciones listos.');
} catch (error) {
  console.error('No se pudo migrar la base de datos:', error.code || error.name);
  process.exitCode = 1;
} finally { await pool.end(); }

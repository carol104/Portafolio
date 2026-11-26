import pg from 'pg';
import path from 'node:path';
import {mkdir, writeFile} from 'node:fs/promises';
import {exportPortfolio, snapshotSummary, DataTransferError} from '../server/data-transfer.js';

if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL para la base de origen.');
const file = path.resolve(process.argv[2] || `backups/portfolio-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000});
try {
  const snapshot = await exportPortfolio(pool);
  await mkdir(path.dirname(file), {recursive: true});
  await writeFile(file, JSON.stringify(snapshot), {flag: 'wx', mode: 0o600});
  console.log(JSON.stringify({file, ...snapshotSummary(snapshot)}));
} catch (error) {
  console.error('Exportación cancelada:', error instanceof DataTransferError ? error.message : error.code || error.name);
  process.exitCode = 1;
} finally { await pool.end(); }

import pg from 'pg';
import {createVercelApp} from '../server/vercel-app.js';

let app;
export default function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({error: 'Configura DATABASE_URL e importa la base de datos antes de publicar.'}));
  }
  if (!app) {
    const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 5000});
    pool.on('error', error => console.error('PostgreSQL pool:', error.code || 'connection error'));
    app = createVercelApp({pool});
  }
  return app(req, res);
}

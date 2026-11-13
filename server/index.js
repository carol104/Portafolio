import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {createApp} from './app.js';
import {createContentStore} from './content-store.js';

const pool=new pg.Pool({connectionString:process.env.DATABASE_URL||'postgres://portfolio:change_this_password@localhost:5432/portfolio',connectionTimeoutMillis:4000,max:10});
pool.on('error',error=>console.error('PostgreSQL pool:',error.code));
const production=process.env.NODE_ENV==='production';
const contentStore=createContentStore(pool);
// Never report successful submissions without durable storage.
try{await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));await contentStore.initialize();console.log('PostgreSQL: esquema y contenido listos.')}catch(error){console.error('PostgreSQL no disponible:',error.code||error.message);if(production){await pool.end();process.exit(1)}}
const app=createApp({pool,production,contentStore,trustProxy:Number(process.env.TRUST_PROXY||0)});
const server=app.listen(process.env.PORT||3001,'0.0.0.0',()=>console.log(`API: http://localhost:${process.env.PORT||3001}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close(async()=>{await pool.end();process.exit(0)});setTimeout(()=>process.exit(1),10000).unref()});

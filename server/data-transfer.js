import {createHash} from 'node:crypto';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {contentSchema} from './content-model.js';
import {courseImagesDirectory} from './course-images.js';
import {projectImagesDirectory} from './project-images.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const tables = {
  site_content: ['id', 'data', 'revision', 'updated_at'],
  portfolio_media: ['id', 'mime', 'filename', 'data', 'created_at'],
  admin_users: ['id', 'email', 'password_hash', 'created_at'],
  contact_messages: ['id', 'name', 'email', 'subject', 'message', 'consent_at', 'created_at'],
  content_migrations: ['id', 'applied_at'],
};
const hash = value => createHash('sha256').update(value).digest('hex');
const assetPattern = /^\/assets\/imagenes_(cursos|proyectos)\/[a-zA-Z0-9 _-]+\.(png|jpe?g|webp)$/i;
export class DataTransferError extends Error {}

function assetPath(url, directory) {
  if (!assetPattern.test(url)) throw new DataTransferError('Ruta de imagen no permitida en la migración.');
  const target = path.resolve(directory, url.slice(1));
  if (!target.startsWith(path.resolve(directory) + path.sep)) throw new DataTransferError('La imagen está fuera de la carpeta pública.');
  return target;
}

async function readAsset(url, {publicDirectory = path.join(root, 'public'), courseImagesPath = courseImagesDirectory, projectImagesPath = projectImagesDirectory} = {}) {
  const files = [
    path.join(url.startsWith('/assets/imagenes_cursos/') ? courseImagesPath : projectImagesPath, path.basename(url)),
    assetPath(url, publicDirectory),
    assetPath(url, path.join(root, 'dist')),
  ];
  for (const file of files) {
    try { return await readFile(file); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  throw new DataTransferError(`No se encontró la imagen vinculada: ${url}`);
}

export async function exportPortfolio(pool, options = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const records = {};
    for (const [table, columns] of Object.entries(tables)) {
      const {rows} = await client.query(`SELECT ${columns.join(',')} FROM ${table} ORDER BY id`);
      records[table] = rows.map(row => table === 'portfolio_media' ? {...row, data: row.data.toString('base64')} : row);
    }
    if (records.site_content.length !== 1) throw new DataTransferError('La base de origen no contiene el portafolio publicado.');
    const content = records.site_content[0].data;
    const urls = [...new Set([...content.projects, ...content.courses].map(item => item.image).filter(url => url?.startsWith('/assets/imagenes_')))];
    const assets = [];
    for (const url of urls) {
      const bytes = await readAsset(url, options);
      assets.push({url, data: bytes.toString('base64'), sha256: hash(bytes)});
    }
    await client.query('COMMIT');
    const payload = JSON.parse(JSON.stringify({format: 'portfolio-transfer', version: 1, exportedAt: new Date().toISOString(), tables: records, assets}));
    return {...payload, checksum: hash(JSON.stringify(payload))};
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export function validateSnapshot(snapshot) {
  const {checksum, ...payload} = snapshot || {};
  if (payload.format !== 'portfolio-transfer' || payload.version !== 1 || checksum !== hash(JSON.stringify(payload))) throw new DataTransferError('El respaldo no es válido o su checksum no coincide.');
  if (!payload.tables || Object.keys(payload.tables).length !== Object.keys(tables).length || !Object.keys(tables).every(table => Array.isArray(payload.tables[table]))) throw new DataTransferError('Faltan tablas en el respaldo.');
  if (payload.tables.site_content.length !== 1 || !contentSchema.safeParse(payload.tables.site_content[0].data).success) throw new DataTransferError('El contenido del respaldo no cumple el formato del portafolio.');
  if (!Array.isArray(payload.assets)) throw new DataTransferError('Falta la lista de imágenes del respaldo.');
  for (const asset of payload.assets) {
    if (!assetPattern.test(asset.url) || hash(Buffer.from(asset.data, 'base64')) !== asset.sha256) throw new DataTransferError('Una imagen del respaldo está dañada o tiene una ruta no permitida.');
  }
  return payload;
}

export async function importPortfolio(pool, snapshot, {publicDirectory = path.join(root, 'public')} = {}) {
  const payload = validateSnapshot(snapshot);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187424)');
    await client.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
    for (const table of [...Object.keys(tables), 'admin_sessions']) {
      if ((await client.query(`SELECT 1 FROM ${table} LIMIT 1`)).rows.length) throw new DataTransferError('La base de destino ya contiene datos. Usa una base o rama nueva; no se reemplazó ningún registro.');
    }
    // Check every existing file before writing any missing file. Never replace
    // an image with different bytes in the checkout used for deployment.
    const missing = [];
    for (const asset of payload.assets) {
      const target = assetPath(asset.url, publicDirectory);
      try {
        if (hash(await readFile(target)) !== asset.sha256) throw new DataTransferError(`Ya existe una imagen distinta: ${asset.url}. Importa en otra copia del proyecto.`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        missing.push({target, bytes: Buffer.from(asset.data, 'base64')});
      }
    }
    for (const file of missing) { await mkdir(path.dirname(file.target), {recursive: true}); await writeFile(file.target, file.bytes, {flag: 'wx'}); }
    for (const [table, columns] of Object.entries(tables)) {
      for (const row of payload.tables[table]) {
        const values = columns.map(column => table === 'portfolio_media' && column === 'data' ? Buffer.from(row[column], 'base64') : table === 'site_content' && column === 'data' ? JSON.stringify(row[column]) : row[column]);
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(',');
        await client.query(`INSERT INTO ${table} (${columns.join(',')}) OVERRIDING SYSTEM VALUE VALUES (${placeholders})`, values);
      }
    }
    await client.query("SELECT setval(pg_get_serial_sequence('contact_messages','id'), COALESCE((SELECT MAX(id) FROM contact_messages),1), EXISTS(SELECT 1 FROM contact_messages))");
    for (const [table, rows] of Object.entries(payload.tables)) {
      const count = Number((await client.query(`SELECT COUNT(*) AS count FROM ${table}`)).rows[0].count);
      if (count !== rows.length) throw new DataTransferError(`No coincide el número de registros de ${table}.`);
    }
    await client.query('COMMIT');
    return snapshotSummary(snapshot);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export function snapshotSummary(snapshot) {
  return {projects: snapshot.tables.site_content[0].data.projects.length, courses: snapshot.tables.site_content[0].data.courses.length, files: snapshot.tables.portfolio_media.length, images: snapshot.assets.length, administrators: snapshot.tables.admin_users.length, messages: snapshot.tables.contact_messages.length, checksum: snapshot.checksum};
}

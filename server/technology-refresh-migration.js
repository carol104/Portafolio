import {catalogGroups, normalizeTechnology} from '../src/technology-catalog.js';

export function refreshTechnologies(groups) {
  const next = structuredClone(groups);
  const rename = {'Network Support and Security': 'Cyberseguridad', 'Data Science Essentials With Python': 'Ciencia de datos', 'Data Science With Python': 'Ciencia de datos'};
  for (const group of next) group.items = [...new Set(group.items.filter(item => item.toLowerCase() !== 'heroku').map(item => rename[item] || item))];
  const existing = new Set(next.flatMap(group => group.items).map(normalizeTechnology));
  for (const [index, items] of [[5, ['Cloudflare', 'Firebase']], [9, ['n8n']], [10, ['Notion']]]) {
    const seed = catalogGroups[index];
    let group = next.find(group => group.id === seed.id || group.title === seed.title);
    if (!group) { group = {...structuredClone(seed), items: []}; next.push(group); }
    for (const item of items) if (!existing.has(normalizeTechnology(item))) { group.items.push(item); existing.add(normalizeTechnology(item)); }
  }
  return next;
}

export async function migrateTechnologyRefresh(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187423)');
    const migration = '2026-11-technology-refresh';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const updated = refreshTechnologies(data.technologyGroups || []);
        if (JSON.stringify(updated) !== JSON.stringify(data.technologyGroups)) {
          data.technologyGroups = updated;
          await client.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1', [JSON.stringify(data)]);
        }
      }
      await client.query('INSERT INTO content_migrations(id) VALUES($1)', [migration]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

import {catalogGroups, canonicalTechnology, normalizeTechnology} from '../src/technology-catalog.js';

export function addMobileOrmMarkup(groups) {
  const next = structuredClone(groups);
  const existing = new Set(next.flatMap(group => group.items).map(item => normalizeTechnology(canonicalTechnology(item))));
  for (const [index, items] of [[0, ['XML']], [1, ['CSS', 'Expo']], [2, ['Prisma']]]) {
    const missing = items.filter(item => !existing.has(normalizeTechnology(item)));
    if (!missing.length) continue;
    const seed = catalogGroups[index];
    let group = next.find(group => group.id === seed.id || group.title === seed.title) || next.find(group => group.icon === seed.icon);
    if (!group) {
      group = {...structuredClone(seed), items: []};
      next.push(group);
    }
    group.items.push(...missing);
    missing.forEach(item => existing.add(normalizeTechnology(item)));
  }
  return next;
}

export async function migrateMobileOrmMarkup(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187423)');
    const migration = '2026-11-expo-prisma-xml-css';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const updated = addMobileOrmMarkup(data.technologyGroups || []);
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

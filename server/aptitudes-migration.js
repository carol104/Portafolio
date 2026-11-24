import { catalogGroups, canonicalTechnology, normalizeTechnology } from '../src/technology-catalog.js';

export function updateTechnologyGroups(groups) {
  const remaining = structuredClone(groups);
  const known = new Set(catalogGroups.flatMap(group => group.items).map(normalizeTechnology));
  const updated = catalogGroups.map((seed, index) => {
    let match = remaining.findIndex(group => group.id === seed.id || group.title === seed.title);
    if (match < 0 && index < 6) match = remaining.findIndex(group => group.icon === seed.icon);
    const existing = match < 0 ? null : remaining.splice(match, 1)[0];
    const customItems = (existing?.items || []).filter(item => !known.has(normalizeTechnology(canonicalTechnology(item))));
    const group = { ...structuredClone(seed), ...existing, items: [...seed.items, ...customItems] };
    if (index === 3 && ['Data y Business Intelligence', 'Bases de datos'].includes(group.title)) {
      group.title = seed.title;
      group.description = seed.description;
    }
    return group;
  });
  return [...updated, ...remaining];
}

export async function migrateAptitudes(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187422)');
    const migration = '2026-11-aptitudes-catalog';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const { rows } = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      const data = rows[0].data;
      data.technologyGroups = updateTechnologyGroups(data.technologyGroups);
      await client.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1', [JSON.stringify(data)]);
      await client.query('INSERT INTO content_migrations(id) VALUES($1)', [migration]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

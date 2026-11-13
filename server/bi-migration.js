import {technologyGroups} from '../src/content.js';

export async function migrateDataBi(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187422)');
    const migration = '2026-11-data-bi';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const before = JSON.stringify(data);
        let group = data.technologyGroups.find(g => g.icon === 'database');
        if (!group) {
          group = {...structuredClone(technologyGroups.find(g => g.icon === 'database')), id: 'expanded-database', visible: true};
          data.technologyGroups.push(group);
        } else {
          if (group.title === 'Bases de datos' || !group.title) {
            group.title = 'Data y Business Intelligence';
          }
          if (group.description === 'Información organizada y accesible.') {
            group.description = 'Información organizada, análisis y visualización de datos.';
          }
          const normalize = val => val.toLowerCase().replace(/[\s._-]/g, '');
          const existing = new Set(group.items.map(normalize));
          for (const item of ['Power BI', 'Grafana']) {
            if (!existing.has(normalize(item))) {
              group.items.push(item);
            }
          }
        }
        if (JSON.stringify(data) !== before) {
          await client.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1', [JSON.stringify(data)]);
        }
      }
      await client.query('INSERT INTO content_migrations(id) VALUES($1)', [migration]);
    }
    await client.query('COMMIT');
  } catch(error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}


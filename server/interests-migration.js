import {interests} from '../src/content.js';

export function updateInterests(items) {
  return items.map(item => {
    const title = (item.title || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const replacement = item.id === 'vision' || title.includes('ideas innovadoras') ? 'nature'
      : item.id === 'music' || title.includes('musica') ? 'sports' : null;
    if (!replacement) return item;
    const {title: nextTitle, description, icon} = interests.find(interest => interest.id === replacement);
    return {...item, title: nextTitle, description, icon};
  });
}

export async function migrateInterests(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187422)');
    const migration = '2026-11-nature-sports-interests';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const updated = updateInterests(data.interests || []);
        if (JSON.stringify(updated) !== JSON.stringify(data.interests)) {
          data.interests = updated;
          await client.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1', [JSON.stringify(data)]);
        }
      }
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

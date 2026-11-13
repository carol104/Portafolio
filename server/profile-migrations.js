import { professionalLinks } from '../src/content.js';

export async function migrateProfileLinks(pool) {
  const client = await pool.connect();
  const migration = '2026-11-carol-linkedin';
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187422)');
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const { rows } = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      const data = rows[0].data;
      if (data.profile.linkedin !== professionalLinks.linkedin) {
        data.profile.linkedin = professionalLinks.linkedin;
        await client.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1', [JSON.stringify(data)]);
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

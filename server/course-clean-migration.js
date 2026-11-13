export async function migrateCourseCleanup(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187422)');
    const migration = '2026-11-courses-clean-certificates';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const { rows } = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const before = JSON.stringify(data);
        if (Array.isArray(data.courses)) {
          data.courses = data.courses
            .filter(c => !c.placeholder && c.id !== 'cisco-placeholder' && c.id !== 'cert-placeholder' && c.id !== 'event-placeholder')
            .map(c => ({
              kind: c.kind || 'Curso',
              credential: c.credential || '',
              certificate: c.certificate || c.url || '',
              badge: c.badge || '',
              ...c,
              placeholder: false
            }));
        }
        if (JSON.stringify(data) !== before) {
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


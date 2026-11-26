export function renameCybersecurity(groups) {
  return groups.map(group => ({...group, items: [...new Set(group.items.map(item =>
    ['network support and security', 'cyberseguridad'].includes(item.toLowerCase()) ? 'Ciberseguridad' : item
  ))]}));
}

export async function migrateCybersecurityLabel(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187423)');
    const migration = '2026-11-ciberseguridad-label';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const updated = renameCybersecurity(data.technologyGroups || []);
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

import {technologyGroups} from '../src/content.js';

export async function migrateQualityTools(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187422)');
    const migration = '2026-11-quality-jenkins';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      const data = rows[0].data;
      let changed = false;
      for (const icon of ['deploy', 'quality']) {
        const seed = technologyGroups.find(group => group.icon === icon);
        let group = data.technologyGroups.find(group => group.icon === icon);
        if (!group) {
          group = {...structuredClone(seed),id:`tools-${icon}`,visible:true};
          data.technologyGroups.push(group);
          changed = true;
        } else {
          const names = new Set(group.items.map(name => name.toLowerCase().trim()));
          const additions = (icon === 'deploy' ? ['Jenkins'] : seed.items).filter(name => !names.has(name.toLowerCase()));
          if (additions.length) { group.items.push(...additions); changed = true; }
        }
      }
      if (changed) await client.query('UPDATE site_content SET data=$1::jsonb,revision=revision+1,updated_at=NOW() WHERE id=1',[JSON.stringify(data)]);
      await client.query('INSERT INTO content_migrations(id) VALUES($1)',[migration]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

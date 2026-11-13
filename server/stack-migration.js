import {technologyGroups} from '../src/content.js';

export async function migrateExpandedStack(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187422)');
    const migration = '2026-11-expanded-stack-cicd';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1',[migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      const data = rows[0].data;
      const before = JSON.stringify(data);
      const additions = {code:['TypeScript'],frontend:['Vite','Tailwind CSS'],database:['MongoDB'],deploy:['Heroku','Railway']};
      const normalize = value => value.toLowerCase().replace(/[\s._-]/g,'');
      for (const [icon,items] of Object.entries(additions)) {
        let group = data.technologyGroups.find(group => group.icon === icon);
        if (!group) {
          group = {...structuredClone(technologyGroups.find(group=>group.icon===icon)),id:`expanded-${icon}`,visible:true};
          data.technologyGroups.push(group);
        } else {
          const existing = new Set(group.items.map(normalize));
          group.items.push(...items.filter(item=>!existing.has(normalize(item))));
        }
      }
      const deploy = data.technologyGroups.find(group=>group.icon==='deploy');
      deploy.title = 'CI/CD y despliegue';
      data.technologyGroups = [...data.technologyGroups.filter(group=>group!==deploy),deploy];
      if (JSON.stringify(data)!==before) await client.query('UPDATE site_content SET data=$1::jsonb,revision=revision+1,updated_at=NOW() WHERE id=1',[JSON.stringify(data)]);
      await client.query('INSERT INTO content_migrations(id) VALUES($1)',[migration]);
    }
    await client.query('COMMIT');
  } catch(error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

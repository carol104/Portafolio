import {access} from 'node:fs/promises';
import path from 'node:path';
import {saveProjectImage, projectImagesDirectory, projectImagesUrl} from './project-images.js';
import {repositoryIdentity} from './project-details-migration.js';

export async function migrateProjectImages(pool, {directory = projectImagesDirectory} = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187423)');
    const migration = '2026-11-project-images-directory';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const before = JSON.stringify(data);
        for (const project of data.projects || []) {
          const media = /^\/api\/media\/([a-f0-9-]{36})$/.exec(project.image || '');
          if (media) {
            const result = await client.query('SELECT mime,filename,data FROM portfolio_media WHERE id=$1', [media[1]]);
            const file = result.rows[0];
            if (file && file.mime.startsWith('image/')) {
              project.image = await saveProjectImage({bytes: file.data, mime: file.mime, filename: project.title, id: media[1], directory});
            }
          }
          const links = [project.github, ...(project.repositories || []).map(item => item.url)];
          if (!project.image && links.some(link => repositoryIdentity(link) === 'carol104/reciclapp')) {
            try { await access(path.join(directory, 'reciclapp.png')); project.image = projectImagesUrl + 'reciclapp.png'; }
            catch (error) { if (error.code !== 'ENOENT') throw error; }
          }
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
  } finally { client.release(); }
}

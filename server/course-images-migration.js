import {saveCourseImage, courseImagesUrl} from './course-images.js';

const banners = new Map([
  ['linux unhatched', 'unhatched-card.webp'],
  ['fundamentos de python 2', 'python.jpg'],
  ['fundamentos de linux', 'linux.webp'],
  ['fundamentos de la ciencia de datos con python', 'data_cience.png'],
]);

export async function migrateCourseImages(pool, {directory} = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187422)');
    const migration = '2026-11-course-images-directory';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const before = JSON.stringify(data);
        for (const course of data.courses || []) {
          const media = /^\/api\/media\/([a-f0-9-]{36})$/.exec(course.image || '');
          if (media) {
            const result = await client.query('SELECT mime,filename,data FROM portfolio_media WHERE id=$1', [media[1]]);
            const file = result.rows[0];
            if (file && file.mime.startsWith('image/')) {
              course.image = await saveCourseImage({bytes: file.data, mime: file.mime, filename: course.title, id: media[1], directory});
            }
          } else if (!course.image) {
            const title = course.title.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            if (banners.has(title)) course.image = courseImagesUrl + banners.get(title);
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

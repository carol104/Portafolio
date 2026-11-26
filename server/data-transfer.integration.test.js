import {test} from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import {mkdir, mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createContentStore} from './content-store.js';
import {exportPortfolio, importPortfolio, DataTransferError} from './data-transfer.js';
import {passwordHash, passwordMatches} from './admin.js';
import {createVercelApp} from './vercel-app.js';

test('migration restores content, private records and image bytes into an empty PostgreSQL database', async t => {
  const connection = new URL(process.env.DATABASE_URL);
  const control = new pg.Pool({connectionString: connection.href});
  const names = ['source', 'target'].map(label => `portfolio_transfer_${label}_${process.pid}_${Date.now()}`);
  const pools = [];
  let server;
  try {
    for (const name of names) {
      assert.match(name, /^portfolio_transfer_(source|target)_\d+_\d+$/);
      await control.query(`CREATE DATABASE "${name}"`);
      const url = new URL(connection); url.pathname = '/' + name;
      pools.push(new pg.Pool({connectionString: url.href}));
    }
    const [source, target] = pools;
    await source.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
    const sourceDirectory = await mkdtemp(path.join(tmpdir(), 'portfolio-export-'));
    const targetDirectory = await mkdtemp(path.join(tmpdir(), 'portfolio-import-'));
    const courseImagesPath = path.join(sourceDirectory, 'assets/imagenes_cursos');
    const projectImagesPath = path.join(sourceDirectory, 'assets/imagenes_proyectos');
    await mkdir(projectImagesPath, {recursive: true});
    const store = createContentStore(source, {courseImagesPath, projectImagesPath});
    await store.initialize();
    const current = await store.read();
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a73cAAAAASUVORK5CYII=', 'base64');
    current.data.projects[0].image = '/assets/imagenes_proyectos/roundtrip-source.png';
    await writeFile(path.join(projectImagesPath, 'roundtrip-source.png'), png);
    await store.save(current.data, current.revision);
    const hash = await passwordHash('Integration migration password 2026!');
    await source.query('INSERT INTO admin_users(id,email,password_hash) VALUES(1,$1,$2)', ['admin@example.invalid', hash]);
    await source.query("INSERT INTO admin_sessions(token_hash,csrf_token,expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour')", ['a'.repeat(64), 'b'.repeat(64)]);
    await source.query("INSERT INTO contact_messages(id,name,email,subject,message,consent_at) OVERRIDING SYSTEM VALUE VALUES(17,'Fixture','fixture@example.invalid','Proyecto','Mensaje que se conserva',NOW())");
    await source.query('INSERT INTO portfolio_media(id,mime,filename,data) VALUES($1,$2,$3,$4)', ['00000000-0000-4000-8000-000000000001', 'image/png', 'original.png', png]);
    const snapshot = await exportPortfolio(source, {publicDirectory: sourceDirectory, courseImagesPath, projectImagesPath});
    assert.ok(!Object.hasOwn(snapshot.tables, 'admin_sessions'));

    await t.test('checksum failure leaves an empty destination untouched', async () => {
      const corrupted = structuredClone(snapshot); corrupted.tables.site_content[0].data.profile.name = 'Changed';
      await assert.rejects(importPortfolio(target, corrupted, {publicDirectory: targetDirectory}), DataTransferError);
      assert.equal((await target.query("SELECT to_regclass('site_content') AS name")).rows[0].name, null);
    });
    await importPortfolio(target, snapshot, {publicDirectory: targetDirectory});
    const restored = await exportPortfolio(target, {publicDirectory: targetDirectory, courseImagesPath: path.join(targetDirectory, 'assets/imagenes_cursos'), projectImagesPath: path.join(targetDirectory, 'assets/imagenes_proyectos')});
    assert.deepEqual(restored.tables, snapshot.tables);
    assert.deepEqual(restored.assets, snapshot.assets);
    assert.deepEqual(await readFile(path.join(targetDirectory, 'assets/imagenes_proyectos/roundtrip-source.png')), png);
    assert.equal((await target.query('SELECT COUNT(*) AS count FROM admin_sessions')).rows[0].count, '0');
    assert.ok(await passwordMatches('Integration migration password 2026!', (await target.query('SELECT password_hash FROM admin_users')).rows[0].password_hash));
    await t.test('a second import refuses to replace existing data', async () => {
      await assert.rejects(importPortfolio(target, snapshot, {publicDirectory: targetDirectory}), /ya contiene datos/);
      assert.deepEqual((await target.query('SELECT data FROM site_content')).rows[0].data, snapshot.tables.site_content[0].data);
    });
    const nextMessage = await target.query("INSERT INTO contact_messages(name,email,subject,message,consent_at) VALUES('Next','next@example.invalid','Proyecto','Mensaje nuevo',NOW()) RETURNING id");
    assert.equal(nextMessage.rows[0].id, '18');

    server = createVercelApp({pool: target, trustProxy: 0, courseImagesPath: '/unwritable-course-directory', projectImagesPath: '/unwritable-project-directory'}).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    await t.test('Vercel API serves migrated content and saves uploads without writing to disk', async () => {
      assert.equal((await fetch(base + '/api/health')).status, 200);
      const content = await (await fetch(base + '/api/content')).json();
      assert.equal(content.data.profile.name, snapshot.tables.site_content[0].data.profile.name);
      const login = await fetch(base + '/api/admin/login', {method: 'POST', headers: {Origin: base, 'Content-Type': 'application/json'}, body: JSON.stringify({email: 'admin@example.invalid', password: 'Integration migration password 2026!'})});
      assert.equal(login.status, 200);
      const cookie = login.headers.get('set-cookie').split(';')[0];
      const {csrfToken} = await login.json();
      const headers = {Origin: base, Cookie: cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken};
      for (const category of ['project-image', 'course-image']) {
        const upload = await fetch(base + '/api/admin/media', {method: 'POST', headers, body: JSON.stringify({category, filename: 'cloud.png', mime: 'image/png', data: png.toString('base64')})});
        assert.equal(upload.status, 201);
        const {url} = await upload.json(); assert.match(url, /^\/api\/media\/[a-f0-9-]{36}$/);
        assert.deepEqual(Buffer.from(await (await fetch(base + url)).arrayBuffer()), png);
      }
      const oversized = Buffer.alloc(3 * 1024 * 1024 + 1); png.copy(oversized);
      const rejected = await fetch(base + '/api/admin/media', {method: 'POST', headers, body: JSON.stringify({filename: 'large.png', mime: 'image/png', data: oversized.toString('base64')})});
      assert.equal(rejected.status, 400); assert.match((await rejected.json()).error, /3 MB/);
      const resume = await fetch(base + '/api/resume'); assert.equal(resume.status, 200); assert.equal(Buffer.from(await resume.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await Promise.all(pools.map(pool => pool.end()));
    for (const name of names) await control.query(`DROP DATABASE IF EXISTS "${name}"`);
    await control.end();
  }
});

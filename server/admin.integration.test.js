// Run inside the app container: node --test server/admin.integration.test.js
// This creates and removes its own isolated database; the live portfolio is untouched.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import {readFile,mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createApp} from './app.js';
import {createContentStore} from './content-store.js';
import {contentSchema} from './content-model.js';
import {verifiedProjectDetails} from './project-details-migration.js';
import {verifiedTeamProjectDetails} from './team-project-details-migration.js';
import {completeKarenProjectDetails, migrateKarenProjectDetails} from './karen-project-details-migration.js';

test('admin setup, authentication, uploads, publication and persistence with PostgreSQL',async t=>{
 const connection=new URL(process.env.DATABASE_URL);const control=new pg.Pool({connectionString:connection.href});
 const database=`portfolio_admin_test_${process.pid}_${Date.now()}`;
 assert.match(database,/^portfolio_admin_test_\d+_\d+$/);
 let pool,server;
 await control.query(`CREATE DATABASE "${database}"`);
 try{
  connection.pathname='/'+database;pool=new pg.Pool({connectionString:connection.href});
  await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
  const courseImagesPath=await mkdtemp(path.join(tmpdir(),'portfolio-course-images-'));
  const store=createContentStore(pool,{courseImagesPath});await store.initialize();
  await t.test('verified projects preserve owner data, use the requested branch and migrate only once',async()=>{
   const original=await store.read();const data=structuredClone(original.data);
   const unrelated=structuredClone(data.projects[0]);
   const targets=verifiedProjectDetails.map((details,index)=>({...structuredClone(data.projects[0]),id:`owner-project-${index}`,title:details.repository.split('/')[1],github:'',repositories:[{name:'Código',url:`https://github.com/${details.repository}`}],image:unrelated.image,contribution:index===3?'Ejemplo de aporte: dashboard ficticio':'Mi aporte confirmado',collaboratorLinks:index===0?[{name:'Colaborador',github:'https://github.com/team'}]:[],collaborators:'',category:'Colaboración',visible:index!==2}));
   data.projects=[unrelated,...targets];
   await pool.query('DELETE FROM content_migrations WHERE id=$1',['2026-11-verified-project-details-v1']);
   await store.save(data,original.revision);await store.initialize();
   const saved=await store.read();assert.ok(contentSchema.safeParse(saved.data).success);
   assert.deepEqual(saved.data.projects[0],unrelated);
   for(const [index,before] of targets.entries()){
    const after=saved.data.projects[index+1];
    for(const key of ['id','title','image','visible','collaborators','collaboratorLinks'])assert.deepEqual(after[key],before[key]);
    if(index!==3)assert.equal(after.contribution,before.contribution);
    assert.equal(after.example,false);assert.ok(after.description.length>100);assert.ok(after.tech.length>0);
   }
   const recicl=saved.data.projects[3];assert.equal(recicl.repositories[0].url,'https://github.com/carol104/ReciclApp/tree/feature/notificaciones');
   assert.ok(recicl.description.includes('demostraciones locales'));
   const dino=saved.data.projects[4];assert.equal(dino.category,'Personal');assert.ok(dino.tech.includes('Java'));assert.ok(dino.contribution.startsWith('Desarrollo completo del juego'));
   saved.data.projects[1].description='Edición posterior de la propietaria';await store.save(saved.data,saved.revision);
   const edited=await store.read();await store.initialize();const repeated=await store.read();
   assert.equal(repeated.revision,edited.revision);assert.equal(repeated.data.projects[1].description,'Edición posterior de la propietaria');
   await pool.query('UPDATE site_content SET data=$1::jsonb,revision=1 WHERE id=1',[JSON.stringify(original.data)]);
  });
  await t.test('team project completion preserves credits and previous projects and respects subsequent edits',async()=>{
   const original=await store.read();const data=structuredClone(original.data);
   const previous={...structuredClone(data.projects[0]),github:'https://github.com/carol104/PrioTask',description:'Texto personalizado después de la primera actualización'};
   const targets=verifiedTeamProjectDetails.map((details,index)=>({...structuredClone(data.projects[0]),id:`team-project-${index}`,title:index?'Iron Zone':'Team Corporate',repositories:undefined,github:`https://github.com/${details.repository}.git`,url:index?'https://example.com/my-demo':'',visible:!index,image:'/api/media/45db9c12-8686-48a5-b435-8f441947729f',category:'Colaboración',contribution:index?'Construcción del módulo de clases y eventos':'Gestión de comentarios',collaboratorLinks:[{name:'Mi equipo',github:'https://github.com/team'}]}));
   data.projects=[previous,...targets];
   await pool.query('DELETE FROM content_migrations WHERE id=$1',['2026-11-verified-team-project-details-v1']);
   await store.save(data,original.revision);await store.initialize();
   const saved=await store.read();assert.ok(contentSchema.safeParse(saved.data).success);
   assert.equal(saved.data.projects[0].description,previous.description);
   for(const [index,before] of targets.entries()){
    const after=saved.data.projects[index+1];
    for(const key of ['id','title','category','contribution','collaboratorLinks','image','visible','github'])assert.deepEqual(after[key],before[key]);
    assert.ok(after.description.length>100);assert.ok(after.tech.length);assert.equal(after.example,false);
   }
   assert.ok(saved.data.projects[1].tech.includes('Angular'));assert.equal(saved.data.projects[1].url,'https://stratium-web.vercel.app');
   assert.ok(saved.data.projects[2].tech.includes('Odoo'));assert.equal(saved.data.projects[2].url,targets[1].url);
   saved.data.projects[1].description='Nueva edición';await store.save(saved.data,saved.revision);
   const edited=await store.read();await store.initialize();const repeated=await store.read();
   assert.equal(repeated.revision,edited.revision);assert.equal(repeated.data.projects[1].description,'Nueva edición');
   await pool.query('UPDATE site_content SET data=$1::jsonb,revision=1 WHERE id=1',[JSON.stringify(original.data)]);
  });
  await t.test('Karen completion changes only its verified fields and preserves future owner edits',async()=>{
   const original=await store.read();const data=structuredClone(original.data);
   const target={...structuredClone(data.projects[0]),id:'karen-owner-id',title:'Ecosistema Karen',github:'',repositories:[{name:'Código',url:'https://github.com/kiramman-mp3/sistema-inventario-supermercado/tree/main'}],contribution:'Base React Native y chatbot',collaboratorLinks:[{name:'Johan',github:'https://github.com/kiramman-mp3'}],visible:false,image:'/api/media/45db9c12-8686-48a5-b435-8f441947729f'};
   data.projects.push(target);
   await pool.query('DELETE FROM content_migrations WHERE id=$1',['2026-11-verified-karen-project-details-v1']);
   await store.save(data,original.revision);await store.initialize();
   const saved=await store.read();assert.ok(contentSchema.safeParse(saved.data).success);
   assert.deepEqual(saved.data.projects.slice(0,-1),original.data.projects);
   const karen=saved.data.projects.at(-1);
   for(const key of ['id','title','category','contribution','collaboratorLinks','image','visible','repositories'])assert.deepEqual(karen[key],target[key]);
   assert.ok(karen.description.includes('FEFO'));assert.ok(karen.tech.includes('React Native'));assert.equal(karen.example,false);assert.equal(karen.url,'https://karen.madebyjohan.xyz');
   assert.equal(completeKarenProjectDetails({...target,url:'https://example.com/custom'}).url,'https://example.com/custom');
   karen.description='Mi edición posterior';await store.save(saved.data,saved.revision);
   const edited=await store.read();await migrateKarenProjectDetails(pool);const repeated=await store.read();
   assert.equal(repeated.revision,edited.revision);assert.equal(repeated.data.projects.at(-1).description,'Mi edición posterior');
   await pool.query('UPDATE site_content SET data=$1::jsonb,revision=1 WHERE id=1',[JSON.stringify(original.data)]);
  });
  await t.test('expanded stack is added once and CI/CD is moved last without losing custom content',async()=>{
   const original=await store.read();const data=structuredClone(original.data);
   const added=['TypeScript','Vite','Tailwind CSS','MongoDB','Heroku','Railway'];
   for(const group of data.technologyGroups)group.items=group.items.filter(item=>!added.includes(item));
   const deploy=data.technologyGroups.find(group=>group.icon==='deploy');deploy.title='Despliegue';
   data.technologyGroups=[deploy,...data.technologyGroups.filter(group=>group!==deploy)];
   data.technologyGroups.find(group=>group.icon==='frontend').items.push('Herramienta personalizada');
   await pool.query('DELETE FROM content_migrations WHERE id=$1',['2026-11-expanded-stack-cicd']);await store.save(data,original.revision);await store.initialize();
   const saved=await store.read();assert.equal(saved.data.technologyGroups.at(-1).title,'CI/CD y despliegue');
   const all=saved.data.technologyGroups.flatMap(group=>group.items);assert.ok(added.every(name=>all.includes(name)));assert.ok(all.includes('Herramienta personalizada'));
   await store.initialize();assert.equal((await store.read()).revision,saved.revision);
   await pool.query('UPDATE site_content SET data=$1::jsonb,revision=1 WHERE id=1',[JSON.stringify(original.data)]);
  });
  await t.test('quality tools migrate without overwriting deployment edits or later removals',async()=>{
   const original=await store.read();const data=structuredClone(original.data);
   data.technologyGroups=data.technologyGroups.filter(group=>group.icon!=='quality');
   const deploy=data.technologyGroups.find(group=>group.icon==='deploy');deploy.title='Mi despliegue';deploy.items=['Docker','Mi herramienta'];
   await pool.query('DELETE FROM content_migrations WHERE id=$1',['2026-11-quality-jenkins']);await store.save(data,original.revision);await store.initialize();
   const migrated=await store.read();assert.deepEqual(migrated.data.technologyGroups.find(group=>group.icon==='quality').items,['Selenium','Playwright','Pytest','SonarQube','JUnit','Normas ISO']);
   const deployment=migrated.data.technologyGroups.find(group=>group.icon==='deploy');assert.equal(deployment.title,'Mi despliegue');assert.ok(deployment.items.includes('Mi herramienta'));assert.ok(deployment.items.includes('Jenkins'));
   deployment.items=deployment.items.filter(item=>item!=='Jenkins');await store.save(migrated.data,migrated.revision);await store.initialize();assert.ok(!(await store.read()).data.technologyGroups.find(group=>group.icon==='deploy').items.includes('Jenkins'));
   await pool.query('UPDATE site_content SET data=$1::jsonb,revision=1 WHERE id=1',[JSON.stringify(original.data)]);
  });
  await t.test('LinkedIn migrates once and later admin edits are preserved',async()=>{
   const original=await store.read();const data=structuredClone(original.data);data.profile.linkedin='';
   await pool.query('DELETE FROM content_migrations WHERE id=$1',['2026-11-carol-linkedin']);await store.save(data,original.revision);await store.initialize();
   const linked=await store.read();assert.ok(linked.data.profile.linkedin.includes('carol-cañizares-villacís-1518833ba'));
   linked.data.profile.linkedin='https://www.linkedin.com/in/updated-by-owner/';await store.save(linked.data,linked.revision);await store.initialize();assert.equal((await store.read()).data.profile.linkedin,'https://www.linkedin.com/in/updated-by-owner/');
   await pool.query('UPDATE site_content SET data=$1::jsonb,revision=1 WHERE id=1',[JSON.stringify(original.data)]);
  });
  await t.test('Angular and Ionic migrate once while preserving customized content',async()=>{
   const original=await store.read();const legacy=structuredClone(original.data);
   const frontend=legacy.technologyGroups.find(g=>g.icon==='frontend');frontend.items=frontend.items.filter(name=>!['Angular','Ionic'].includes(name));frontend.items.push('Svelte');frontend.title='Mi frontend personalizado';
   await pool.query('DELETE FROM content_migrations WHERE id=$1',['2026-11-angular-ionic']);
   await store.save(legacy,original.revision);await store.initialize();
   const migrated=await store.read();const migratedGroup=migrated.data.technologyGroups.find(g=>g.icon==='frontend');assert.equal(migratedGroup.title,'Mi frontend personalizado');assert.ok(['Angular','Ionic','Svelte'].every(name=>migratedGroup.items.includes(name)));
   migratedGroup.items=migratedGroup.items.filter(name=>name!=='Ionic');await store.save(migrated.data,migrated.revision);await store.initialize();assert.ok(!(await store.read()).data.technologyGroups.find(g=>g.icon==='frontend').items.includes('Ionic'));
   // Restore the seed revision for the remaining API checks in this isolated test.
   await pool.query('UPDATE site_content SET data=$1::jsonb,revision=1 WHERE id=1',[JSON.stringify(original.data)]);
  });
  const setupToken='private-isolated-test-setup-code-123456789';
  server=createApp({pool,contentStore:store,setupToken,production:true,courseImagesPath}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const request=async(path,{method='GET',data,cookie,csrf,origin=base}={})=>{const response=await fetch(base+path,{method,headers:{Origin:origin,...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(data?{body:JSON.stringify(data)}:{})});const json=response.headers.get('content-type')?.includes('application/json')?await response.json():null;return {response,json}};
  const credentials={email:'admin@example.invalid',password:'Isolated admin test password!2026',setupToken};
  await t.test('unconfigured admin is not publicly writable',async()=>{assert.equal((await request('/api/admin/content')).response.status,401);const status=await request('/api/admin/session');assert.equal(status.json.configured,false);assert.equal((await request('/api/admin/setup',{method:'POST',data:{...credentials,setupToken:'wrong'}})).response.status,403);assert.equal((await request('/api/admin/setup',{method:'POST',data:credentials,origin:'https://untrusted.example'})).response.status,403)});
  const setup=await request('/api/admin/setup',{method:'POST',data:credentials});assert.equal(setup.response.status,201);const cookie=setup.response.headers.get('set-cookie').split(';')[0],csrf=setup.json.csrfToken;
  assert.match(setup.response.headers.get('set-cookie'),/HttpOnly/);assert.match(setup.response.headers.get('set-cookie'),/SameSite=Strict/);
  await t.test('setup is single use and stored password is hashed',async()=>{assert.equal((await request('/api/admin/setup',{method:'POST',data:credentials})).response.status,409);const {rows}=await pool.query('SELECT password_hash FROM admin_users');assert.notEqual(rows[0].password_hash,credentials.password);assert.equal((await request('/api/admin/login',{method:'POST',data:{...credentials,password:'incorrect-test-password'}})).response.status,401)});
  const snapshot=(await request('/api/admin/content',{cookie})).json;
  await t.test('publication enforces CSRF, safe URLs and revision control',async()=>{
   assert.equal((await request('/api/admin/content',{method:'PUT',cookie,data:snapshot})).response.status,403);
   const bad=structuredClone(snapshot);bad.data.profile.github='javascript:alert(1)';assert.equal((await request('/api/admin/content',{method:'PUT',cookie,csrf,data:bad})).response.status,400);
   snapshot.data.courses.push({id:'test-course',title:'Curso de prueba',institution:'Academia de prueba',period:'2026',description:'Contenido de integración.',url:'https://example.com/certificate',tech:['React'],visible:true});
   snapshot.data.projects[0].visible=false;snapshot.data.technologyGroups[0].items.push('Tecnologia de prueba');
   const saved=await request('/api/admin/content',{method:'PUT',cookie,csrf,data:snapshot});assert.equal(saved.response.status,200);assert.equal(saved.json.revision,2);
   assert.equal((await request('/api/admin/content',{method:'PUT',cookie,csrf,data:snapshot})).response.status,409);
   const published=await request('/api/content');assert.equal(published.json.data.courses[0].title,'Curso de prueba');assert.equal(published.json.data.projects.length,3);assert.ok(published.json.data.technologyGroups[0].items.includes('Tecnologia de prueba'));
   const reopened=createContentStore(pool);assert.equal((await reopened.read()).data.courses[0].id,'test-course');
  });
  await t.test('file uploads require login and validate file signatures',async()=>{const payload={filename:'preview.png',mime:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a73cAAAAASUVORK5CYII='};assert.equal((await request('/api/admin/media',{method:'POST',data:payload})).response.status,401);assert.equal((await request('/api/admin/media',{method:'POST',cookie,csrf,data:{...payload,data:Buffer.from('<script>bad</script>').toString('base64')}})).response.status,400);const upload=await request('/api/admin/media',{method:'POST',cookie,csrf,data:payload});assert.equal(upload.response.status,201);const image=await fetch(base+upload.json.url);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');assert.equal(Buffer.from(await image.arrayBuffer()).toString('base64'),payload.data)});
  await t.test('course banners are saved in their directory, served publicly and editable after publication',async()=>{
   const payload={category:'course-image',filename:'../../mi curso.png',mime:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a73cAAAAASUVORK5CYII='};
   const uploaded=await request('/api/admin/media',{method:'POST',cookie,csrf,data:payload});
   assert.equal(uploaded.response.status,201);assert.match(uploaded.json.url,/^\/assets\/imagenes_cursos\/mi-curso-[a-f0-9-]+\.png$/);
   const bytes=await readFile(path.join(courseImagesPath,path.basename(uploaded.json.url)));
   assert.equal(bytes.toString('base64'),payload.data);
   const image=await fetch(base+uploaded.json.url);assert.equal(image.status,200);assert.equal(Buffer.from(await image.arrayBuffer()).toString('base64'),payload.data);
   const current=(await request('/api/admin/content',{cookie})).json;current.data.courses[0].image=uploaded.json.url;
   assert.equal((await request('/api/admin/content',{method:'PUT',cookie,csrf,data:current})).response.status,200);
   assert.equal((await request('/api/content')).json.data.courses[0].image,uploaded.json.url);
   const duplicate=await request('/api/admin/media',{method:'POST',cookie,csrf,data:payload});assert.notEqual(duplicate.json.url,uploaded.json.url);
   assert.equal((await fetch(base+'/assets/imagenes_cursos/missing.png')).status,404);
   const pdf={...payload,mime:'application/pdf',data:Buffer.from('%PDF-1.4').toString('base64')};
   assert.equal((await request('/api/admin/media',{method:'POST',cookie,csrf,data:pdf})).response.status,400);
  });
  await t.test('private messages are unavailable without an admin session',async()=>{assert.equal((await request('/api/admin/messages')).response.status,401);await pool.query("INSERT INTO contact_messages(name,email,subject,message,consent_at) VALUES('Prueba','test@example.invalid','Proyecto','Mensaje privado de prueba',NOW())");assert.equal((await request('/api/admin/messages',{cookie})).json.messages.length,1)});
  await t.test('logout revokes the server-side session',async()=>{assert.equal((await request('/api/admin/logout',{method:'POST',cookie,csrf})).response.status,200);assert.equal((await request('/api/admin/content',{cookie})).response.status,401)});
  await t.test('password change invalidates previous sessions',async()=>{const login=await request('/api/admin/login',{method:'POST',data:credentials});assert.equal(login.response.status,200);const oldCookie=login.response.headers.get('set-cookie').split(';')[0];const change=await request('/api/admin/password',{method:'POST',cookie:oldCookie,csrf:login.json.csrfToken,data:{current:credentials.password,password:'Replacement private test password 2026!'}});assert.equal(change.response.status,200);assert.equal((await request('/api/admin/content',{cookie:oldCookie})).response.status,401);const newCookie=change.response.headers.get('set-cookie').split(';')[0];assert.equal((await request('/api/admin/content',{cookie:newCookie})).response.status,200)});
  await t.test('SPA and dynamic theme respond in production',async()=>{const admin=await fetch(base+'/admin');assert.equal(admin.status,200);assert.match(admin.headers.get('content-type'),/text\/html/);const theme=await fetch(base+'/api/theme.css');assert.equal(theme.status,200);assert.ok((await theme.text()).includes('--blue:'))});
 }finally{if(server)await new Promise(resolve=>server.close(resolve));if(pool)await pool.end();await control.query(`DROP DATABASE "${database}"`);await control.end()}
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialContent} from '../src/content.js';
import {contentSchema,publicContent,normalizeContent} from './content-model.js';
import {passwordHash,passwordMatches} from './admin.js';
import {filterCourses} from '../src/portfolio.js';
import {updateInterests} from './interests-migration.js';
import {updateTechnologyGroups} from './aptitudes-migration.js';

test('aptitudes catalog covers requested skills with at least three entries per category',()=>{
 const groups=initialContent.technologyGroups;
 const all=new Set(groups.flatMap(group=>group.items));
 const requested=['Expo','Prisma','XML','CSS','Arquitectura orientada a servicios (SOA)','Odoo','Normas ISO','Bootstrap','jQuery','Java Servlet','Tomcat','Desarrollo de API','Microservicios','MySQL','Eclipse','Trello','JIRA','Desarrollo de Software','GitHub','Git','Vercel V0','JUnit','Selenium','MongoDB','SQL Server Management Studio','Spring Boot','Laravel','Express.js','Tailwind CSS','Ionic Framework','Angular','SonarQube','Pytest','Grafana','Blazor','JavaScript','Oracle Database','Scrum','PhpMyAdmin','PHP','React Native','Jenkins','TypeScript','HTML','ASP.NET','SQL Server Integration Services (SSIS)','PostgreSQL','Node.js','React.js','Docker','C#','Análisis de datos','Ciencia de datos','Seguridad de redes','Cyberseguridad', 'Notion', 'n8n', 'Cloudflare', 'Firebase','Java','Linux','Python'];
 for(const item of requested)assert.ok(all.has(item),item);
 for(const group of groups)assert.ok(group.items.length>=3,group.title);
 assert.equal(all.size,groups.flatMap(group=>group.items).length);
});

test('aptitudes migration redistributes legacy data and preserves custom content and visibility',()=>{
 const legacy=[
  {id:'languages',icon:'code',title:'Mis lenguajes',description:'Personalizado',items:['Python','Rust'],visible:false},
  {id:'db',icon:'database',title:'Data y Business Intelligence',items:['Oracle','SQL Server','Grafana','Power BI'],visible:true},
  {id:'ui',icon:'frontend',title:'Mi frontend',items:['React','Ionic','Svelte'],visible:true},
 ];
 const updated=updateTechnologyGroups(legacy);
 const languages=updated.find(group=>group.id==='languages');
 assert.equal(languages.title,'Mis lenguajes');assert.equal(languages.visible,false);assert.ok(languages.items.includes('Rust'));
 const db=updated.find(group=>group.id==='db');
 assert.equal(db.title,'Bases de datos');assert.ok(db.items.includes('Oracle Database'));assert.ok(!db.items.includes('Grafana'));
 const ui=updated.find(group=>group.id==='ui');assert.ok(ui.items.includes('React.js'));assert.ok(ui.items.includes('Svelte'));assert.ok(!ui.items.includes('React'));
 assert.ok(updated.find(group=>group.title==='Datos y análisis').items.includes('Grafana'));
 assert.deepEqual(updateTechnologyGroups(updated),updated);
 const draft=structuredClone(initialContent);draft.technologyGroups=updated;
 assert.equal(contentSchema.safeParse(draft).success,true);
});

test('course filters support all types and legacy courses',()=>{
 const courses=[{id:'legacy'},{id:'course',kind:'Curso'},{id:'cert',kind:'Certificación'},{id:'event',kind:'Evento'}];
 assert.equal(filterCourses(courses,'Todos').length,4);
 assert.deepEqual(filterCourses(courses,'Curso').map(item=>item.id),['legacy','course']);
 assert.deepEqual(filterCourses(courses,'Certificación').map(item=>item.id),['cert']);
 assert.deepEqual(filterCourses(courses,'Evento').map(item=>item.id),['event']);
 assert.deepEqual(filterCourses([],'Evento'),[]);
});

test('requested interests replace saved text while preserving other interests',()=>{
 const items=[{id:'ideas',title:'Ideas innovadoras',visible:true},{id:'songs',title:'Música mientras programo',visible:false},{id:'photo',title:'Fotografía'}];
 const updated=updateInterests(items);
 assert.equal(updated[0].title,'Naturaleza');
 assert.equal(updated[1].title,'Deportes');
 assert.match(updated[1].description,/fútbol y básquet/);
 assert.equal(updated[1].visible,false);
 assert.deepEqual(updated[2],items[2]);
});

test('training details survive publication and reject invalid dates',()=>{
 const draft=structuredClone(initialContent);
 for(const kind of ['Curso','Certificación','Evento']){
  draft.courses=[{id:'training',title:'Formación',institution:'Academia',period:'',description:'',url:'',tech:[],visible:true,kind,startDate:'2026-11-16',endDate:'2026-12-16',duration:'40 horas',modality:'Online',location:'Ecuador',status:'En curso',role:'Asistente'}];
  const published=publicContent(contentSchema.parse(draft)).courses[0];
  for(const key of ['startDate','endDate','duration','modality','location','status','role'])assert.equal(published[key],draft.courses[0][key]);
  draft.courses[0].endDate='2026-11-15';
  assert.equal(contentSchema.safeParse(draft).success,false);
  draft.courses[0].endDate='2026-02-30';
  assert.equal(contentSchema.safeParse(draft).success,false);
  draft.courses[0].startDate='';draft.courses[0].endDate='';
  assert.equal(contentSchema.safeParse(draft).success,true);
 }
});

test('initial portfolio conforms to the editable content schema',()=>{
 const parsed=contentSchema.safeParse(initialContent);
 assert.equal(parsed.success,true,parsed.error?.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));
});

test('project collaborator links support variable teams and preserve legacy credits',()=>{
 const draft=normalizeContent(initialContent);
 assert.deepEqual(draft.projects[0].collaboratorLinks,[]);
 const credits=draft.projects[2].collaborators;
 draft.projects[2].github='https://github.com/team/project';
 draft.projects[2].collaboratorLinks=Array.from({length:125},(_,index)=>({name:`Person ${index}`,github:`https://github.com/person-${index}`}));
 const parsed=contentSchema.parse(draft);
 assert.equal(parsed.projects[2].collaboratorLinks.length,125);
 assert.equal(publicContent(parsed).projects[2].collaborators,credits);
 assert.equal(publicContent(parsed).projects[2].collaboratorLinks[124].github,'https://github.com/person-124');
 draft.projects[2].collaboratorLinks[0].github='javascript:alert(1)';
 assert.equal(contentSchema.safeParse(draft).success,false);
});

test('repository lists retain legacy links and support zero, one or many repositories',()=>{
 const legacy=structuredClone(initialContent);
 legacy.projects[0].github='https://github.com/team/original';
 const draft=normalizeContent(legacy);
 assert.deepEqual(draft.projects[0].repositories,[{name:'',url:legacy.projects[0].github}]);
 draft.projects[0].repositories=Array.from({length:125},(_,i)=>({name:`Part ${i}`,url:`https://github.com/team/part-${i}`}));
 const parsed=contentSchema.parse(draft);
 assert.equal(publicContent(parsed).projects[0].repositories.length,125);
 draft.projects[0].repositories=[];
 assert.deepEqual(normalizeContent(draft).projects[0].repositories,[]);
 draft.projects[0].repositories=[{name:'',url:'https://github.com/team/single'}];
 assert.equal(contentSchema.safeParse(draft).success,true);
 draft.projects[0].repositories.push({name:'Backend',url:'https://github.com/team/backend'});
 assert.equal(contentSchema.safeParse(draft).success,false);
 draft.projects[0].repositories[0].name='Frontend';
 assert.equal(contentSchema.safeParse(draft).success,true);
 draft.projects[0].repositories[0].url='javascript:alert(1)';
 assert.equal(contentSchema.safeParse(draft).success,false);
});
test('open source projects and course kinds are accepted',()=>{
 const draft=structuredClone(initialContent);
 draft.projects[0].category='Open Source';
 draft.projects[0].collaborators='Equipo de ejemplo';
 draft.courses.push({
  id:'test-course',
  title:'Curso de React',
  institution:'Platzi',
  period:'2026',
  description:'Formación avanzada',
  url:'https://example.com/course',
  tech:['React'],
  kind:'Evento',
  credential:'XYZ',
  certificate:'/api/media/11111111-2222-3333-4444-555555555555',
  badge:'',
  visible:true
 });
 assert.equal(contentSchema.safeParse(draft).success,true);
});

test('course files and optional online verification stay separate',()=>{
 const draft=structuredClone(initialContent);
 const courseWithoutCert={
  id:'course-1',
  title:'Curso sin certificado',
  institution:'Academia',
  period:'2026',
  description:'',
  url:'',
  tech:[],
  kind:'Curso',
  credential:'',
  certificate:'',
  badge:'',
  visible:true
 };
 draft.courses=[courseWithoutCert];
 assert.equal(contentSchema.safeParse(draft).success,true);
 const onlineOnly=structuredClone(draft);onlineOnly.courses[0].url='https://example.com/verify';
 const onlineParsed=contentSchema.parse(onlineOnly);assert.equal(onlineParsed.courses[0].certificate,'');
 const invalid=structuredClone(draft);invalid.courses[0].certificate='https://example.com/certificate.pdf';
 assert.equal(contentSchema.safeParse(invalid).success,false);
 const normalized=normalizeContent(invalid);assert.equal(normalized.courses[0].certificate,'');assert.equal(normalized.courses[0].url,'https://example.com/certificate.pdf');

 const courseWithCert={
  ...courseWithoutCert,
  certificate:'/api/media/11111111-2222-3333-4444-555555555555',
  badge:'/api/media/22222222-3333-4444-5555-666666666666'
 };
 draft.courses=[courseWithCert];
 assert.equal(contentSchema.safeParse(draft).success,true);
});
test('public content omits hidden items without changing stored content',()=>{const draft=structuredClone(initialContent);draft.projects[0].visible=false;const result=publicContent(draft);assert.equal(result.projects.length,draft.projects.length-1);assert.equal(draft.projects.length,4);assert.ok(!result.projects.some(p=>p.id===draft.projects[0].id))});
test('published links and theme cannot contain executable URLs or CSS',()=>{for(const [section,key,value] of [['profile','github','javascript:alert(1)'],['appearance','accent','#fff;}body{display:none}']]){const draft=structuredClone(initialContent);draft[section][key]=value;assert.equal(contentSchema.safeParse(draft).success,false)}});
test('passwords are salted and verified with scrypt',async()=>{const hash=await passwordHash('A unique test passphrase 2026');assert.ok(!hash.includes('passphrase'));assert.ok(await passwordMatches('A unique test passphrase 2026',hash));assert.equal(await passwordMatches('wrong passphrase',hash),false);assert.notEqual(await passwordHash('A unique test passphrase 2026'),hash)});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialContent} from '../src/content.js';
import {contentSchema,publicContent,normalizeContent} from './content-model.js';
import {passwordHash,passwordMatches} from './admin.js';

test('initial portfolio conforms to the editable content schema',()=>{
 const parsed=contentSchema.safeParse(initialContent);
 assert.equal(parsed.success,true,parsed.error?.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));
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

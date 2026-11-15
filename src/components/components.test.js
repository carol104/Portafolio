import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {transformWithEsbuild} from 'vite';

const require=createRequire(import.meta.url);
async function component(filename,dependencies={}){
 const source=await readFile(new URL(filename,import.meta.url),'utf8');
 const {code}=await transformWithEsbuild(source,filename,{jsx:'transform',jsxFactory:'React.createElement',format:'cjs'});
 const module={exports:{}};
 const resolve=id=>dependencies[id]||require(id);
 new Function('module','exports','require','React',code)(module,module.exports,resolve,React);
 return module.exports;
}

test('page navigation points to dedicated routes and Home alone has section navigation',async()=>{
 for(const path of ['/','/proyectos','/cursos','/contacto']){
  const {default:Header}=await component('Header.jsx',{
   './Brand':{__esModule:true,default:()=>React.createElement('a',{href:'/'},'Portfolio')},
   './MagneticButton':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},
   '../ContentContext':{useContent:()=>({appearance:{brand:'Portfolio'}})},
   '../router':{useRouter:()=>({path})},
   '../motion':{m:{span:({layoutId,transition,...props})=>React.createElement('span',props)}},
  });
  const html=renderToStaticMarkup(React.createElement(Header,{activeSection:'experiencia'}));
  const primary=html.match(/<nav id="portfolio-navigation"[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...primary.matchAll(/href="([^"]+)"/g)].map(match=>match[1]),['/','/proyectos','/cursos','/contacto']);
  assert.match(primary,new RegExp(`href="${path}"[^>]*aria-current="page"`));
  assert.equal(html.includes('aria-label="Secciones de Home"'),path==='/');
  assert.match(html,/href="\/contacto"/);
  if(path==='/'){
   assert.match(html,/href="#experiencia" aria-current="location"/);
   for(const id of ['inicio','sobre-mi','tecnologias','experiencia','intereses'])assert.ok(html.includes(`href="#${id}"`));
   assert.ok(html.includes('Sobre mí'));assert.ok(html.includes('Tecnologías'));
  }
 }
});

test('Home previews limit cards and link to complete catalogs without limiting dedicated pages',async()=>{
 const passthrough=({children})=>React.createElement('div',null,children);
 const defaultExport=fn=>({__esModule:true,default:fn});
 const button=defaultExport(({children,href})=>React.createElement('a',{href},children));
 const heading=defaultExport(passthrough);
 const {default:Projects}=await component('ProjectsSection.jsx',{
  'framer-motion':{AnimatePresence:passthrough},
  './SectionHeading':heading,
  './ProjectCard':defaultExport(({project})=>React.createElement('article',{'data-project':project.id},project.title)),
  './MagneticButton':button,
  '../motion':{m:{div:passthrough}},
  '../portfolio':await import('../portfolio.js'),
 });
 const projects=Array.from({length:6},(_,i)=>({id:`project-${i}`,title:`Project ${i}`,category:'Personal',tech:[]}));
 for(const preview of [true,false]){
  const html=renderToStaticMarkup(React.createElement(Projects,{projects,preview}));
  assert.equal([...html.matchAll(/data-project=/g)].length,preview?4:6);
  if(preview)assert.match(html,/href="\/proyectos"/);
 }
 const {default:Courses}=await component('../Courses.jsx',{
  './components/SectionHeading':heading,
  './components/ExternalLink':button,
  './components/TechnologyTags':defaultExport(()=>null),
  './components/SpotlightCard':defaultExport(passthrough),
  './components/PlatformLogo':defaultExport(()=>null),
  './components/MagneticButton':button,
  './motion':{Stagger:passthrough,fadeUp:{}},
 });
 const courses=Array.from({length:5},(_,i)=>({id:`course-${i}`,title:`Course ${i}`,kind:'Curso'}));
 courses[0].certificate='/api/media/11111111-2222-3333-4444-555555555555';
 courses[1].certificate='https://example.com/legacy-certificate';
 courses[1].url='https://example.com/verify';
 for(const preview of [true,false]){
  const html=renderToStaticMarkup(React.createElement(Courses,{courses,preview}));
  assert.equal([...html.matchAll(/class="course-title"/g)].length,preview?2:5);
  assert.ok(html.includes(courses[0].certificate));
  assert.ok(!html.includes(courses[1].certificate));
  assert.ok(!html.includes(courses[1].url));
  if(preview)assert.match(html,/href="\/cursos"/);
 }
});

test('professional links in both header and contact open a separate tab safely',async()=>{
 const anchor=await component('ExternalLink.jsx');
 const {default:SocialLinks}=await component('SocialLinks.jsx',{'./ExternalLink':anchor});
 const profile={github:'https://github.com/carol104',linkedin:'https://www.linkedin.com/in/carol-cañizares-villacís-1518833ba/'};
 for(const compact of [true,false]){
  const html=renderToStaticMarkup(React.createElement(SocialLinks,{profile,compact}));
  const links=[...html.matchAll(/<a\b[^>]*>/g)].map(match=>match[0]);
  assert.equal(links.length,2);
  for(const link of links){assert.match(link,/target="_blank"/);assert.match(link,/rel="noopener noreferrer"/)}
  assert.ok(html.includes(profile.github));assert.ok(html.includes(profile.linkedin));
  assert.match(html,/se abre en una pestaña nueva/);
 }
});

test('project filters combine category and stack without dropping real items',async()=>{
 const {filterProjects}=await import('../portfolio.js');
 const projects=[
  {id:'a',category:'Personal',tech:['React']},
  {id:'b',category:'Colaboración',tech:['React','Express']},
  {id:'c',category:'Open Source',tech:['Git']},
 ];
 assert.equal(filterProjects(projects,'Todos','Todos').length,3);
 assert.deepEqual(filterProjects(projects,'Personal','Todos').map(p=>p.id),['a']);
 assert.deepEqual(filterProjects(projects,'Todos','React').map(p=>p.id),['a','b']);
 assert.equal(filterProjects(projects,'Clientes','React').length,0);
});

test('section headings share semantic titles and optional descriptions',async()=>{
 const {default:Heading}=await component('SectionHeading.jsx',{'../motion':{Reveal:({children,className})=>React.createElement('div',{className},children)}});
 const html=renderToStaticMarkup(React.createElement(Heading,{number:'01',kicker:'Sobre mí',id:'about-title',text:'Una presentación legible.'},'Carol'));
 assert.match(html,/<h2 id="about-title">Carol<\/h2>/);assert.ok(html.includes('Una presentación legible.'));
});

test('technology logos and Data & Business Intelligence box are configured with svgs',async()=>{
 const {technologyLogoName}=await component('../TechnologyLogo.jsx');
 const {technologyGroups}=await import('../content.js');
 const biGroup=technologyGroups.find(g=>g.icon==='database');
 assert.ok(biGroup);
 assert.equal(biGroup.title,'Data y Business Intelligence');
 assert.ok(biGroup.items.includes('Grafana'));
 assert.ok(biGroup.items.includes('Power BI'));
 assert.equal(technologyLogoName('Grafana'),'grafana');
 assert.equal(technologyLogoName('Power BI'),'powerbi');
 const {access}=await import('node:fs/promises');
 await access(new URL('../../public/technology-logos/grafana.svg',import.meta.url));
 await access(new URL('../../public/technology-logos/powerbi.svg',import.meta.url));
});

test('platform logos for Cisco and Udemy resolve correctly and svgs exist',async()=>{
 const {platformLogoName}=await component('PlatformLogo.jsx');
 assert.equal(platformLogoName('Cisco'),'cisco');
 assert.equal(platformLogoName('Cisco Networking Academy'),'cisco');
 assert.equal(platformLogoName('Udemy'),'udemy');
 const {access}=await import('node:fs/promises');
 await access(new URL('../../public/technology-logos/cisco.svg',import.meta.url));
 await access(new URL('../../public/technology-logos/udemy.svg',import.meta.url));
});

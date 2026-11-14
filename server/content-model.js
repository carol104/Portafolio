import {z} from 'zod';
import {COURSE_KINDS, INTEREST_ICONS, PREVIEW_STYLES, PROJECT_CATEGORIES} from '../src/portfolio.js';
const short=z.string().trim().max(150);
const required=short.min(1);
const text=z.string().trim().max(5000);
const url=z.string().max(2048).refine(value=>{
 if(!value)return true;
 try{const parsed=new URL(value);return ['http:','https:'].includes(parsed.protocol)&&!parsed.username&&!parsed.password}catch{return false}
},'Usa un enlace completo con https://');
const media=z.string().max(2048).refine(value=>!value||/^\/api\/media\/[a-f0-9-]{36}$/.test(value)||url.safeParse(value).success,'Usa una imagen subida o un enlace http(s) válido');
const base={id:z.string().min(1).max(80),visible:z.boolean()};
const courseSchema = z.object({
 ...base,
 title: required,
 institution: required,
 period: short,
 description: text,
 url,
 tech: z.array(required).max(30),
 kind: z.enum(COURSE_KINDS).default('Curso'),
 credential: short.default(''),
 platform: z.string().trim().max(100).default(''),
 certificate: z.string().trim().max(2048).default(''),
 badge: z.string().trim().max(2048).refine(
  value => !value || /^\/api\/media\/[a-f0-9-]{36}$/.test(value) || url.safeParse(value).success,
  'Sube un archivo PDF o PNG para la insignia'
 ).default(''),
 image: media.default(''),
 placeholder: z.boolean().default(false)
}).transform(course => {
 if (!course.certificate && course.url) course.certificate = course.url;
 return course;
}).refine(course => {
 const cert = course.certificate;
 return Boolean(cert && (/^\/api\/media\/[a-f0-9-]{36}$/.test(cert) || url.safeParse(cert).success));
}, {
 message: 'El certificado es obligatorio (sube un archivo PDF o PNG)',
 path: ['certificate']
});

export const contentSchema=z.object({
 profile:z.object({name:required,initials:z.string().max(5),role:required,location:short,email:z.union([z.email(),z.literal('')]),github:url,linkedin:url,available:z.boolean(),isExample:z.boolean(),objective:text,about:text,education:z.object({title:short,institution:short,period:short}),showEducation:z.boolean(),resumeUrl:z.string().refine(v=>!v||/^\/api\/media\/[a-f0-9-]{36}$/.test(v),'Sube un PDF desde el panel')}),
 projects:z.array(z.object({...base,title:required,subtitle:short,category:z.enum(PROJECT_CATEGORIES),type:short,tech:z.array(required).max(30),style:z.enum(PREVIEW_STYLES),description:text,contribution:text,collaborators:z.string().trim().max(500).default(''),github:url,url,example:z.boolean(),image:media})).max(100),
 technologyGroups:z.array(z.object({...base,title:required,description:short,icon:z.enum(['code','frontend','backend','database','deploy','quality']),items:z.array(required).max(100)})).max(30),
 experience:z.array(z.object({...base,type:short,title:required,place:short,text})).max(100),
 courses:z.array(courseSchema).max(100),
 interests:z.array(z.object({...base,title:required,description:text,icon:z.enum(INTEREST_ICONS)})).max(30),
 appearance:z.object({brand:required,headline:z.string().trim().min(1).max(160),summary:z.string().max(500),accent:z.string().regex(/^#[0-9a-fA-F]{6}$/),background:z.string().regex(/^#[0-9a-fA-F]{6}$/)}),
});
export function normalizeContent(data){
 const next=structuredClone(data);
 next.projects=(next.projects||[]).map(project=>({collaborators:'',...project,category:PROJECT_CATEGORIES.includes(project.category)?project.category:'Personal',style:PREVIEW_STYLES.includes(project.style)?project.style:'orbit'}));
 next.courses=(next.courses||[]).filter(course=>!course.placeholder&&course.id!=='cisco-placeholder'&&course.id!=='cert-placeholder'&&course.id!=='event-placeholder').map(course=>({kind:'Curso',credential:'',platform:course.platform||(course.institution?.toLowerCase().includes('cisco')?'Cisco':course.institution?.toLowerCase().includes('udemy')?'Udemy':course.institution||''),certificate:course.certificate||course.url||'',badge:course.badge||'',image:course.image||'',...course,placeholder:false,kind:COURSE_KINDS.includes(course.kind)?course.kind:'Curso'}));
 next.interests=(next.interests||[]).map(item=>({...item,icon:INTEREST_ICONS.includes(item.icon)?item.icon:'idea'}));
 if(next.profile?.education?.title==='Tu carrera o formación') next.profile.education.title='Ingeniería de Software';
 return next;
}
export function publicContent(data){const content=structuredClone(data);for(const key of ['projects','technologyGroups','experience','courses','interests'])content[key]=content[key].filter(item=>item.visible);return content}

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
export const contentSchema=z.object({
 profile:z.object({name:required,initials:z.string().max(5),role:required,location:short,email:z.union([z.email(),z.literal('')]),github:url,linkedin:url,available:z.boolean(),isExample:z.boolean(),objective:text,about:text,education:z.object({title:short,institution:short,period:short}),showEducation:z.boolean(),resumeUrl:z.string().refine(v=>!v||/^\/api\/media\/[a-f0-9-]{36}$/.test(v),'Sube un PDF desde el panel')}),
 projects:z.array(z.object({...base,title:required,subtitle:short,category:z.enum(PROJECT_CATEGORIES),type:short,tech:z.array(required).max(30),style:z.enum(PREVIEW_STYLES),description:text,contribution:text,collaborators:z.string().trim().max(500).default(''),github:url,url,example:z.boolean(),image:media})).max(100),
 technologyGroups:z.array(z.object({...base,title:required,description:short,icon:z.enum(['code','frontend','backend','database','deploy','quality']),items:z.array(required).max(100)})).max(30),
 experience:z.array(z.object({...base,type:short,title:required,place:short,text})).max(100),
 courses:z.array(z.object({...base,title:required,institution:required,period:short,description:text,url,tech:z.array(required).max(30),kind:z.enum(COURSE_KINDS).default('Curso'),credential:short.default(''),placeholder:z.boolean().default(false)})).max(100),
 interests:z.array(z.object({...base,title:required,description:text,icon:z.enum(INTEREST_ICONS)})).max(30),
 appearance:z.object({brand:required,headline:z.string().trim().min(1).max(160),summary:z.string().max(500),accent:z.string().regex(/^#[0-9a-fA-F]{6}$/),background:z.string().regex(/^#[0-9a-fA-F]{6}$/)}),
});
export function normalizeContent(data){
 const next=structuredClone(data);
 next.projects=(next.projects||[]).map(project=>({collaborators:'',...project,category:PROJECT_CATEGORIES.includes(project.category)?project.category:'Personal',style:PREVIEW_STYLES.includes(project.style)?project.style:'orbit'}));
 next.courses=(next.courses||[]).map(course=>({kind:'Curso',credential:'',placeholder:false,...course,kind:COURSE_KINDS.includes(course.kind)?course.kind:'Curso'}));
 next.interests=(next.interests||[]).map(item=>({...item,icon:INTEREST_ICONS.includes(item.icon)?item.icon:'idea'}));
 if(next.profile?.education?.title==='Tu carrera o formación') next.profile.education.title='Ingeniería de Software';
 return next;
}
export function publicContent(data){const content=structuredClone(data);for(const key of ['projects','technologyGroups','experience','courses','interests'])content[key]=content[key].filter(item=>item.visible);return content}

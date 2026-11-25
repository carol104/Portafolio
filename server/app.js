import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { createResume } from './resume.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContentStore } from './content-store.js';
import { mountAdmin } from './admin.js';
import { initialContent } from '../src/content.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contactSchema = z.object({
 name:z.string().trim().min(2).max(100),
 email:z.email().max(254),
 subject:z.enum(['Proyecto','Empleo','Colaboración','Otro']),
 message:z.string().trim().min(10).max(5000),
 consent:z.literal('on'),
 website:z.string().max(300).optional().default(''),
});
export function createApp({pool,production=false,trustProxy=0,logger=console,contentStore=createContentStore(pool),setupToken=process.env.ADMIN_SETUP_TOKEN||'',courseImagesPath,projectImagesPath}={}) {
 const app=express();
 app.disable('x-powered-by');
 app.set('trust proxy',trustProxy);
 app.use(helmet({contentSecurityPolicy:production?{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'"],imgSrc:["'self'","data:","https:"],fontSrc:["'self'"],connectSrc:["'self'"],objectSrc:["'none'"],upgradeInsecureRequests:null}}:false,strictTransportSecurity:production?undefined:false}));
 const adminJson=express.json({limit:'1mb'}),publicJson=express.json({limit:'16kb'});
 app.use((req,res,next)=>req.path==='/api/admin/media'?next():(req.path.startsWith('/api/admin/')?adminJson:publicJson)(req,res,next));
 mountAdmin(app,{pool,store:contentStore,setupToken,courseImagesPath,projectImagesPath});
 app.get('/api/health',async(_req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'})}catch{res.status(503).json({status:'unavailable',database:'disconnected'})}});
 app.post('/api/contact',rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Has enviado varios mensajes. Inténtalo de nuevo en 15 minutos.'}}),async(req,res)=>{
  const parsed=contactSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Revisa los campos: nombre, correo válido, tema, mensaje de 10 a 5000 caracteres y consentimiento.'});
  const {name,email,subject,message,website}=parsed.data;
  if(website)return res.status(400).json({error:'No se pudo procesar el formulario.'});
  try{await pool.query('INSERT INTO contact_messages (name, email, subject, message, consent_at) VALUES ($1, $2, $3, $4, NOW())',[name,email,subject,message]);res.status(201).json({message:'Mensaje guardado correctamente.'})}catch(error){logger.error('Contact database error:',error.code||'database unavailable');res.status(503).json({error:'No podemos guardar mensajes en este momento. Por favor, inténtalo más tarde.'})}
 });
 app.get('/api/resume',async(_req,res)=>{
  let data;
  try{({data}=await contentStore.read())}catch{data=initialContent}
  if(data.profile.resumeUrl)return res.redirect(data.profile.resumeUrl);
  res.type('pdf').set('Content-Disposition','inline; filename="hoja-de-vida.pdf"');
  createResume(data).pipe(res);
 });
 app.use('/api',(_req,res)=>res.status(404).json({error:'Recurso no encontrado.'}));
 if(production){app.use(express.static(path.join(root,'dist')));app.get('/{*path}',(_req,res)=>res.sendFile(path.join(root,'dist','index.html')))}
 app.use((error,_req,res,_next)=>{if(error.type==='entity.too.large')return res.status(413).json({error:'El mensaje supera el tamaño permitido.'});if(error instanceof SyntaxError&&error.status===400)return res.status(400).json({error:'El formato del mensaje no es válido.'});logger.error('Request failed:',error.code||error.name);res.status(500).json({error:'No se pudo procesar la solicitud.'})});
 return app;
}

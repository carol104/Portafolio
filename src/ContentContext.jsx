import {createContext,useContext,useEffect,useState} from 'react';
import {initialContent} from './content.js';
const Context=createContext(null);
export const useContent=()=>useContext(Context);
export function ContentProvider({children}){
 const [content,setContent]=useState(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();let cancelled=false;const timer=setTimeout(()=>controller.abort(),8000);setError(false);fetch('/api/content',{signal:controller.signal,cache:'no-store'}).then(async response=>{if(!response.ok)throw Error();const result=await response.json();if(!cancelled){setContent(result.data);setError(false);document.title=`${result.data.profile.name} · ${result.data.profile.role}`}}).catch(()=>{if(!cancelled){setError(true);setContent(current=>current||initialContent)}});return()=>{cancelled=true;clearTimeout(timer);controller.abort()}},[attempt]);
 useEffect(()=>{if(!content)return;const refresh=async()=>{if(document.visibilityState==='hidden')return;try{const r=await fetch('/api/content',{cache:'no-store'});if(r.ok){const result=await r.json();setContent(current=>JSON.stringify(current)===JSON.stringify(result.data)?current:result.data)}}catch{}};window.addEventListener('focus',refresh);const timer=setInterval(refresh,60000);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh)}},[!!content]);
 useEffect(()=>{if(content){document.title=`${content.profile.name} · ${content.profile.role}`;const link=document.getElementById('portfolio-theme');if(link){document.head.appendChild(link);link.href='/api/theme.css?v='+Date.now()}}},[content]);
 if(!content)return <div className="public-loading" role="status"><span className="brand">dev.folio</span><p>{error?'No pudimos cargar el portafolio. Inténtalo nuevamente.':'Preparando ideas, proyectos y un poco de código…'}</p>{error&&<button className="button primary" onClick={()=>setAttempt(attempt+1)}>Volver a intentar</button>}</div>;
 return <Context.Provider value={content}>{children}</Context.Provider>
}

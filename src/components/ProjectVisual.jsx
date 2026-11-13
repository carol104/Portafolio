import {useState,useEffect,useId} from 'react';
import {PREVIEW_STYLES} from '../portfolio.js';

function GenericPreview({ title, large = false }) {
    return <div className={`preview generic ${large ? 'large' : ''}`} role="img" aria-label={`Vista previa de ${title}`}><div className="preview-placeholder"><span aria-hidden="true">◈</span><p>{title}</p><small>Vista previa no disponible</small></div></div>;
}

function Preview({ kind, large = false }) {
    const gradientId = useId();
    if (!PREVIEW_STYLES.includes(kind)) return <GenericPreview title={kind} large={large} />;
    return <div className={`preview ${kind} ${large ? 'large' : ''}`} aria-label={`Vista conceptual de ${kind}`} role="img"><div className="preview-window"><div className="window-top"><span /><span /><span /><small>{kind === 'store' ? 'nexo.store' : kind === 'analytics' ? 'pulse / overview' : kind === 'hack' ? 'build.together' : 'orbit.workspace'}</small><i>↗</i></div>{kind === 'orbit' ? <div className="orbit-app"><aside><b>◒ orbit</b><span>⌂ &nbsp; Workspace</span><span>▦ &nbsp; Mis proyectos</span><span>◷ &nbsp; Calendario</span><em>+ Nuevo proyecto</em></aside><div className="orbit-content"><small>WORKSPACE / PROYECTOS</small><h4>Todo empieza con una idea <span>✧</span></h4><p>Un buen día para construir algo increíble.</p><div className="mini-stats"><div>Proyectos activos<b>08 <i>↗</i></b></div><div>Tareas completadas<b>24 <i>↗</i></b></div></div><div className="kanban">{['Por hacer', 'En progreso', 'Listo'].map((s, i) => <div key={s}><strong><i />{s}</strong><article><span className="tiny-tag">{['Diseño', 'Desarrollo', 'Revisión'][i]}</span><p>{['Nueva identidad visual', 'Componentes de la app', 'Explorar nuevas ideas'][i]}</p><footer><span>◉ ◉</span><small>⋯</small></footer></article><article><p>{['Investigar referencias', 'Conectar la API', 'Diseño responsive'][i]}</p><footer>◉ <small>⋯</small></footer></article></div>)}</div></div></div> : kind === 'store' ? <div className="store-app"><nav><b>nexo<span>®</span></b><small>Objetos &nbsp; Colección &nbsp; Nosotros</small><span>Bolsa (0)</span></nav><div><small>MENOS, PERO MEJOR.</small><h4>Diseñado para<br />tu día a día.</h4><p>Objetos que hacen la diferencia.</p><b className="store-button">Explora la colección ↗</b><div className="sculpture"><div /><span /></div></div><footer>DISEÑO CON INTENCIÓN <span>EST. 2026</span></footer></div> : kind === 'analytics' ? <div className="analytics-app"><nav><b>◈ pulse</b><small>Resumen &nbsp; Reportes &nbsp; Actividad</small></nav><p>Tu negocio, en perspectiva.</p><div className="metrics"><div>Ingresos totales<b>$24,850</b><span>↗ 12.8%</span></div><div>Usuarios activos<b>1,482</b><span>↗ 8.2%</span></div><div>Conversión<b>4.32%</b><span>↗ 2.4%</span></div></div><div className="chart"><small>Rendimiento general</small><svg viewBox="0 0 400 95"><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#559aff" stopOpacity=".4" /><stop offset="1" stopColor="#559aff" stopOpacity="0" /></linearGradient></defs><path d="M0 83 Q30 80 50 65 T100 70 T160 44 T210 50 T260 28 T310 33 T355 18 T400 4 V95 H0Z" fill={`url(#${gradientId})`} /><path d="M0 83 Q30 80 50 65 T100 70 T160 44 T210 50 T260 28 T310 33 T355 18 T400 4" stroke="#70acff" fill="none" strokeWidth="3" /></svg></div></div> : <div className="hack-app"><span>✳</span><small>IDEAS QUE NOS CONECTAN</small><h4>Build something.<br /><em>Build together.</em></h4><p>Un pequeño experimento. Muchas posibilidades.</p><div><span>React</span><span>Supabase</span><span>Comunidad</span></div></div>}</div></div>
}

function isVideo(src) {
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(src || '');
}

export default function ProjectVisual({ project, large = false }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [project.image]);
    const fallback = PREVIEW_STYLES.includes(project.style)
        ? <Preview kind={project.style} large={large} />
        : <GenericPreview title={project.title} large={large} />;
    if (!project.image || failed) return fallback;
    const className = `preview project-image ${large ? 'large' : ''}`;
    if (isVideo(project.image)) {
        return <div className={className}><video src={project.image} title={`Vista previa de ${project.title}`} muted playsInline controls={large} preload="metadata" onError={() => setFailed(true)} /></div>;
    }
    return <div className={className}><img src={project.image} alt={`Vista previa de ${project.title}`} loading="lazy" onError={() => setFailed(true)} /></div>;
}

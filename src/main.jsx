import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowDown, Download, MapPin, Check, Terminal, Database, Compass, Gamepad2, Music2, Lightbulb, Code2, Camera, Binoculars, Braces } from 'lucide-react';
import { ContentProvider, useContent } from './ContentContext';
import { RouterProvider, useRouter } from './router';
import './public-content.css';
import './motion.css';
const Admin = lazy(() => import('./Admin'));
import Technologies from './Technologies';
import './styles.css';
import './interface.css';
import SectionTitle from './components/SectionHeading';
import SocialLinks from './components/SocialLinks';
import MagneticButton from './components/MagneticButton';
import SpotlightCard from './components/SpotlightCard';
import Header from './components/Header';
import Footer from './components/Footer';
import ProjectsPage from './ProjectsPage';
import CoursesPage from './CoursesPage';
import ContactPage from './ContactPage';
import ProjectsSection from './components/ProjectsSection';
import ProjectDialog from './components/ProjectDialog';
import Courses from './Courses';
import { MotionRoot, Reveal, Stagger, fadeUp, m } from './motion';

const interestIcons = { terminal: Terminal, database: Database, compass: Compass, music: Music2, game: Gamepad2, idea: Lightbulb, camera: Camera, bird: Binoculars };

function App() {
    const { profile, experience, interests, appearance, projects, courses } = useContent();
    const [active, setActive] = useState('inicio');
    const [selected, setSelected] = useState(null);
    const trigger = useRef(null);
    function openProject(project, element) {
        trigger.current = element;
        setSelected(project);
    }
    useEffect(() => {
        const sections = [...document.querySelectorAll('main section[id]')];
        let frame;
        const update = () => {
            const boundary = 230;
            const current = sections.filter(section => section.getBoundingClientRect().top <= boundary).at(-1);
            setActive(current?.id || 'inicio');
        };
        const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
    }, []);
    const headline = appearance.headline.split('\n');
    return <>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <Header activeSection={active} />
        <main id="contenido">
            <section id="inicio" className="hero content-container">
                <div className="hero-grid" aria-hidden="true" />
                <m.div className="hero-copy" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
                    <m.p className="hello" variants={fadeUp}>Hola, soy {profile.name} <span className="wave">✦</span></m.p>
                    <m.h1 variants={fadeUp}>{headline.map((line, index) => <span className={'headline-line ' + (index === 1 ? 'headline-accent' : 'headline-plain')} key={index}>{line}</span>)}</m.h1>
                    <m.p className="hero-description" variants={fadeUp}>{profile.role}. {appearance.summary}</m.p>
                    <m.div className="hero-actions" variants={fadeUp}>
                        <MagneticButton className="button primary" href="/proyectos">Explorar proyectos <ArrowUpRight size={18} /></MagneticButton>
                        <MagneticButton className="button secondary" href="/api/resume" target="_blank" rel="noreferrer" aria-label="Ver y descargar la hoja de vida en PDF">
                            <Download size={17} /> Ver / descargar CV
                        </MagneticButton>
                    </m.div>
                    <m.div className="hero-bottom" variants={fadeUp}>
                        <span><MapPin size={17} />{profile.location}</span>
                        <SocialLinks profile={profile} compact />
                    </m.div>
                </m.div>
                <div className="hero-visual" aria-hidden="true">
                    <div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" />
                    <div className="visual-cross cross-one">+</div><div className="visual-cross cross-two">+</div>
                    <div className="float-label label-react"><Braces size={18} /> React</div>
                    <div className="code-window">
                        <div className="code-top"><div><i /><i /><i /></div><span>about-me.js</span><Code2 size={15} /></div>
                        <div className="code-body">
                            <div className="code-line"><span><em>const</em> developer <em>=</em> {'{'}</span></div>
                            <div className="code-line"><span>&nbsp; name: <b>'{profile.name}'</b>,</span></div>
                            <div className="code-line"><span>&nbsp; role: <b>'{profile.role}'</b>,</span></div>
                            <div className="code-line"><span>&nbsp; stack: [<b>'React'</b>, <b>'Node.js'</b>],</span></div>
                            <div className="code-line"><span>&nbsp; coffee: <strong>true</strong></span></div>
                            <div className="code-line"><span>{'};'}</span></div>
                            <div className="code-line comment"><span>// Menos límites. Más posibilidades.</span></div>
                            <div className="code-line"><span>buildSomething<em>(</em><b>'increíble'</b><em>)</em>;<i className="cursor" /></span></div>
                        </div>
                        <div className="code-status"><span><span /> listo para construir</span><span>JavaScript &nbsp; UTF-8</span></div>
                    </div>
                    <div className="float-label label-backend"><Database size={18} /><div>Ideas sólidas.<small>De la interfaz a los datos.</small></div><span className="check-circle"><Check size={12} /></span></div>
                </div>
                <a href="#sobre-mi" className="scroll-cue"><span>DESCUBRE MÁS</span><ArrowDown size={15} /></a>
                <div className="hero-index">DISEÑO + CÓDIGO + PROPÓSITO</div>
            </section>
            <section id="sobre-mi" className="section about">
                <SectionTitle>Sobre mí</SectionTitle>
                <div className="about-grid">
                    <Reveal className="portrait-scene">
                        <div className="portrait-orbit" aria-hidden="true" />
                        <span className="portrait-cross portrait-cross--top" aria-hidden="true">+</span>
                        <span className="portrait-cross portrait-cross--bottom" aria-hidden="true">+</span>
                        <div className="about-art about-art--photo">
                            <img className="about-portrait" src="/assets/yo.jpg" alt={`Retrato de ${profile.name}`} width="970" height="1296" loading="lazy" decoding="async" />
                        </div>
                        <span className="portrait-code" aria-hidden="true"><Braces size={23} /></span>
                        <div className="portrait-note"><Code2 size={17} aria-hidden="true" /><span>Siempre aprendiendo<span className="portrait-note-dot" aria-hidden="true" /></span><span className="portrait-note-line" aria-hidden="true" /></div>
                    </Reveal>
                    <Reveal className="about-content">
                        <p className="large-text">{profile.about}</p>
                        <p>{profile.objective}</p>
                        <div className="about-values"><span><Check size={15} /> Atención al detalle</span><span><Check size={15} /> Aprendizaje continuo</span><span><Check size={15} /> Trabajo en equipo</span><span><Check size={15} /> Soluciones con propósito</span></div>
                        {profile.showEducation && <div className="education"><div><small>FORMACIÓN {profile.isExample && '· POR PERSONALIZAR'}</small><h3>{profile.education.title}</h3><p>{[profile.education.institution, profile.education.period].filter(Boolean).join(' · ')}</p></div></div>}
                    </Reveal>
                </div>
            </section>
            <Technologies />
            <ProjectsSection projects={projects} onOpen={openProject} preview />
            <section id="experiencia" className="section experience">
                <Reveal className="experience-intro">
                    <p className="eyebrow">EL CAMINO RECORRIDO</p>
                    <h2>Aprender.<br />Construir.<br /><span>Evolucionar.</span></h2>
                    <p>Cada reto aporta una nueva perspectiva. Aquí hay espacio para contar tu recorrido profesional.</p>
                    <MagneticButton href="/api/resume" target="_blank" rel="noreferrer" className="text-link" aria-label="Ver y descargar la hoja de vida en PDF">Ver hoja de vida <ArrowUpRight size={17} /></MagneticButton>
                </Reveal>
                <div className="timeline">{experience.map((e, i) => <Reveal as="article" key={e.id} delay={i * 0.06}><span className="timeline-node" /><div className="timeline-top"><small>{e.type}</small><span>{String(i + 1).padStart(2, '0')}</span></div><h3>{e.title}</h3><h4>{e.place}</h4><p>{e.text}</p></Reveal>)}</div>
            </section>
            <Courses courses={courses} preview />
            <section id="intereses" className="section interests">
                <SectionTitle kicker="MÁS ALLÁ DEL CÓDIGO">Hobbies e <span>intereses técnicos.</span></SectionTitle>
                <Stagger className="interest-grid">
                    {(interests.length ? interests : [{ id: 'placeholder', icon: 'idea', title: 'Añade un interés', description: 'Completa esta tarjeta desde el panel: hackatones, Supabase, IA, fotografía u observación de aves.' }]).map(item => {
                        const Icon = interestIcons[item.icon] || Lightbulb;
                        return <SpotlightCard key={item.id} className="interest-card" variants={fadeUp}><Icon /><h3>{item.title}</h3><p>{item.description}</p></SpotlightCard>;
                    })}
                </Stagger>
            </section>

        </main>
        <Footer />
        <ProjectDialog project={selected} onClose={() => setSelected(null)} triggerRef={trigger} />
    </>;
}

function PageRouter() {
    const { path } = useRouter();

    if (path === '/proyectos') {
        return <ProjectsPage />;
    }
    if (path === '/contacto') {
        return <ContactPage />;
    }
    if (path === '/cursos') {
        return <CoursesPage />;
    }
    return <App />;
}

createRoot(document.getElementById('root')).render(
    location.pathname.startsWith('/admin') ? (
        <Suspense fallback={<div className="public-loading">Abriendo tu espacio…</div>}>
            <Admin />
        </Suspense>
    ) : (
        <ContentProvider>
            <RouterProvider>
                <MotionRoot>
                    <PageRouter />
                </MotionRoot>
            </RouterProvider>
        </ContentProvider>
    )
);

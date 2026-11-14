import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowDown, Download, MapPin, Check, Layers, Terminal, Database, Compass, Gamepad2, Music2, Lightbulb, Code2, Camera, Binoculars, Braces } from 'lucide-react';
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
import { MotionRoot, Reveal, Stagger, fadeUp, m } from './motion';

const interestIcons = { terminal: Terminal, database: Database, compass: Compass, music: Music2, game: Gamepad2, idea: Lightbulb, camera: Camera, bird: Binoculars };

function App() {
    const { profile, experience, interests, appearance } = useContent();
    const [active, setActive] = useState('inicio');
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
            <section id="inicio" className="hero">
                <div className="hero-grid" aria-hidden="true" />
                <m.div className="hero-copy" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
                    <m.p className="availability" variants={fadeUp}><span /> {profile.available ? 'Abierto a nuevas oportunidades' : 'Bienvenido a mi espacio digital'}</m.p>
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
                        <span><MapPin size={17}/>{profile.location}</span>
                        <SocialLinks profile={profile} compact/>
                    </m.div>
                </m.div>
                <div className="hero-visual" aria-hidden="true">
                    <div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" />
                    <div className="visual-cross cross-one">+</div><div className="visual-cross cross-two">+</div>
                    <div className="float-label label-react"><Braces size={18} /> React</div>
                    <div className="code-window">
                        <div className="code-top"><div><i /><i /><i /></div><span>about-me.js</span><Code2 size={15} /></div>
                        <div className="code-body">
                            <div className="code-line"><small>01</small><span><em>const</em> developer <em>=</em> {'{'}</span></div>
                            <div className="code-line"><small>02</small><span>&nbsp; name: <b>'{profile.name}'</b>,</span></div>
                            <div className="code-line"><small>03</small><span>&nbsp; role: <b>'{profile.role}'</b>,</span></div>
                            <div className="code-line"><small>04</small><span>&nbsp; stack: [<b>'React'</b>, <b>'Node.js'</b>],</span></div>
                            <div className="code-line"><small>05</small><span>&nbsp; mindset: <b>'Siempre aprendiendo'</b>,</span></div>
                            <div className="code-line"><small>06</small><span>&nbsp; coffee: <strong>true</strong></span></div>
                            <div className="code-line"><small>07</small><span>{'};'}</span></div>
                            <div className="code-line comment"><small>08</small><span>// Menos límites. Más posibilidades.</span></div>
                            <div className="code-line"><small>09</small><span>buildSomething<em>(</em><b>'increíble'</b><em>)</em>;<i className="cursor" /></span></div>
                        </div>
                        <div className="code-status"><span><span /> listo para construir</span><span>JavaScript &nbsp; UTF-8</span></div>
                    </div>
                    <div className="float-label label-backend"><Database size={18} /><div>Ideas sólidas.<small>De la interfaz a los datos.</small></div><span className="check-circle"><Check size={12} /></span></div>
                </div>
                <a href="#sobre-mi" className="scroll-cue"><span>SCROLL PARA DESCUBRIR</span><ArrowDown size={15} /></a>
                <div className="hero-index">DISEÑO + CÓDIGO + PROPÓSITO</div>
            </section>
            <Technologies />
            <section id="sobre-mi" className="section about">
                <SectionTitle number="01" kicker="UN POCO SOBRE MÍ">Detrás de cada línea,<br /><span>una persona curiosa.</span></SectionTitle>
                <div className="about-grid">
                    <Reveal className="about-art"><div className="initials">{profile.initials}<span>✳</span></div><div className="art-caption"><Code2 size={18} /><span>Construir también es<br /><b>una forma de explorar.</b></span><ArrowUpRight size={24} /></div><div className="art-coordinates">CREATIVIDAD × TECNOLOGÍA</div></Reveal>
                    <Reveal className="about-content">
                        <p className="large-text">{profile.about}</p>
                        <p>{profile.objective}</p>
                        <div className="about-values"><span><Check size={15} /> Atención al detalle</span><span><Check size={15} /> Aprendizaje continuo</span><span><Check size={15} /> Trabajo en equipo</span><span><Check size={15} /> Soluciones con propósito</span></div>
                        {profile.showEducation && <div className="education"><span className="education-icon"><Layers size={20} /></span><div><small>FORMACIÓN {profile.isExample && '· POR PERSONALIZAR'}</small><h3>{profile.education.title}</h3><p>{profile.education.institution} · {profile.education.period}</p></div></div>}
                    </Reveal>
                </div>
            </section>
            <section id="experiencia" className="section experience">
                <Reveal className="experience-intro">
                    <p className="eyebrow"><span>03 /</span> EL CAMINO RECORRIDO</p>
                    <h2>Aprender.<br />Construir.<br /><span>Evolucionar.</span></h2>
                    <p>Cada reto aporta una nueva perspectiva. Aquí hay espacio para contar tu recorrido profesional.</p>
                    <MagneticButton href="/api/resume" target="_blank" rel="noreferrer" className="text-link" aria-label="Ver y descargar la hoja de vida en PDF">Ver hoja de vida <ArrowUpRight size={17} /></MagneticButton>
                </Reveal>
                <div className="timeline">{experience.map((e, i) => <Reveal as="article" key={e.id} delay={i * 0.06}><span className="timeline-node" /><div className="timeline-top"><small>{e.type}</small><span>{String(i + 1).padStart(2, '0')}</span></div><h3>{e.title}</h3><h4>{e.place}</h4><p>{e.text}</p></Reveal>)}</div>
            </section>
            <section id="intereses" className="section interests">
                <SectionTitle number="05" kicker="MÁS ALLÁ DEL CÓDIGO">Hobbies e <span>intereses técnicos.</span></SectionTitle>
                <Stagger className="interest-grid">
                    {(interests.length ? interests : [{ id: 'placeholder', icon: 'idea', title: 'Añade un interés', description: 'Completa esta tarjeta desde el panel: hackatones, Supabase, IA, fotografía u observación de aves.' }]).map(item => {
                        const Icon = interestIcons[item.icon] || Lightbulb;
                        return <SpotlightCard key={item.id} className="interest-card" variants={fadeUp}><Icon /><h3>{item.title}</h3><p>{item.description}</p></SpotlightCard>;
                    })}
                </Stagger>
            </section>

        </main>
        <Footer />
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

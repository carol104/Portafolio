import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowUpRight, List } from 'lucide-react';
import Brand from './Brand';
import MagneticButton from './MagneticButton';
import { useContent } from '../ContentContext';
import { useRouter } from '../router';
import { m } from '../motion';

export default function Header({ activeSection = '' }) {
  const { appearance } = useContent();
  const { path } = useRouter();
  const [menu, setMenu] = useState(false);
  const sectionLinks = useRef(null);
  const sectionNavigation = useRef(null);
  const sectionToggle = useRef(null);
  const [sectionsOpen, setSectionsOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Proyectos', path: '/proyectos' },
    { label: 'Cursos', path: '/cursos' },
    { label: 'Contacto', path: '/contacto' },
  ];
  const sections = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'sobre-mi', label: 'Sobre mí' },
    { id: 'tecnologias', label: 'Tecnologías' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'experiencia', label: 'Experiencia' },
    { id: 'cursos', label: 'Cursos' },
    { id: 'intereses', label: 'Intereses' },
  ];
  const isHome = path === '/';
  useEffect(() => { setMenu(false); }, [path]);
  useEffect(() => {
    if (!isHome || !sectionsOpen) return;
    const list = sectionLinks.current;
    const current = list?.querySelector('[aria-current="location"]');
    if (!current) return;
    const top = current.offsetTop;
    if (top < list.scrollTop || top + current.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({
        top: top - (list.clientHeight - current.offsetHeight) / 2,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
  }, [activeSection, isHome, sectionsOpen]);
  useEffect(() => {
    if (!sectionsOpen) return;
    const onPointerDown = (event) => {
      if (!sectionNavigation.current?.contains(event.target)) setSectionsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [sectionsOpen]);
  useEffect(() => {
    if (!menu) return;
    const close = (event) => { if (event.key === 'Escape') setMenu(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menu]);

  return (
    <div className={isHome ? "site-navigation site-navigation--home" : "site-navigation"}>
      <header className="header">
        <div className="content-container header-inner">
          <Brand name={appearance.brand} href="/" />
          <nav id="portfolio-navigation" className={menu ? 'open' : ''} aria-label="Navegación principal">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={path === item.path ? 'active' : ''}
                aria-current={path === item.path ? 'page' : undefined}
                onClick={() => setMenu(false)}
              >
                <span className="nav-label">{item.label}</span>
              </a>
            ))}
          </nav>
          <MagneticButton className="nav-cta" href="/contacto">
            <span className="nav-label">Hablemos</span> <ArrowUpRight size={15} />
          </MagneticButton>
          <button
            className="menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
            aria-controls="portfolio-navigation"
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {isHome && (
        <nav className="home-navigation" aria-label="Secciones de Home" ref={sectionNavigation}>
          <div id="home-sections" className="home-scrollspy" hidden={!sectionsOpen}>
            <div className="home-navigation-links" ref={sectionLinks}>
            {sections.map((section) => {
              const current = (activeSection || 'inicio') === section.id;
              return (
                <a key={section.id} href={'#' + section.id} aria-label={section.label} title={section.label} aria-current={current ? 'location' : undefined}>
                  <span className="home-section-label">{section.label}</span>
                  {current && <m.span className="home-navigation-indicator" layoutId="home-section-indicator" transition={{ type: 'spring', stiffness: 360, damping: 34 }} />}
                </a>
              );
            })}
            </div>
          </div>
          <button
            type="button"
            className="home-scrollspy-toggle"
            ref={sectionToggle}
            aria-controls="home-sections"
            aria-expanded={sectionsOpen}
            aria-label={sectionsOpen ? 'Replegar secciones' : 'Desplegar secciones'}
            title={sectionsOpen ? 'Replegar secciones' : 'Desplegar secciones'}
            onClick={() => setSectionsOpen(open => !open)}
          >
            {sectionsOpen ? <X size={17} aria-hidden="true" /> : <List size={17} aria-hidden="true" />}
          </button>
        </nav>
      )}
    </div>
  );
}


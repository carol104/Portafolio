import React, { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Brand from './Brand';
import MagneticButton from './MagneticButton';
import { useContent } from '../ContentContext';
import { useRouter } from '../router';
import { m } from '../motion';

export default function Header({ activeSection = '' }) {
  const { appearance } = useContent();
  const { path } = useRouter();
  const [menu, setMenu] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
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
      <nav className="home-navigation" aria-label="Secciones de Home">
        <div className="content-container home-navigation-links">
          {sections.map((section) => {
            const current = (activeSection || 'inicio') === section.id;
            return (
              <a key={section.id} href={'#' + section.id} aria-current={current ? 'location' : undefined}>
                {section.label}
                {current && <m.span className="home-navigation-indicator" layoutId="home-section-indicator" transition={{ type: 'spring', stiffness: 360, damping: 34 }} />}
              </a>
            );
          })}
        </div>
      </nav>
    )}
    </div>
  );
}


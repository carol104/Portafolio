import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Brand from './Brand';
import MagneticButton from './MagneticButton';
import { useContent } from '../ContentContext';
import { useRouter } from '../router';

export default function Header({ activeSection = '' }) {
  const { appearance } = useContent();
  const { path } = useRouter();
  const [menu, setMenu] = useState(false);

  const navItems = [
    { id: 'sobre-mi', label: 'Sobre mí', hash: 'sobre-mi' },
    { id: 'tecnologias', label: 'Tecnologías', hash: 'tecnologias' },
    { id: 'proyectos', label: 'Proyectos', path: '/proyectos' },
    { id: 'experiencia', label: 'Experiencia', hash: 'experiencia' },
    { id: 'cursos', label: 'Cursos', path: '/cursos' },
    { id: 'intereses', label: 'Intereses', hash: 'intereses' },
    { id: 'contacto', label: 'Contacto', hash: 'contacto' },
  ];

  const isHome = path === '/';

  return (
    <header className="header">
      <Brand name={appearance.brand} href="/" />
      <nav id="portfolio-navigation" className={menu ? 'open' : ''} aria-label="Navegación principal">
        {navItems.map((item) => {
          let href;
          let isActive = false;

          if (item.path) {
            href = item.path;
            isActive = path === item.path;
          } else {
            href = isHome ? '#' + item.hash : '/#' + item.hash;
            isActive = isHome && activeSection === item.hash;
          }

          return (
            <a
              key={item.id}
              href={href}
              className={isActive ? 'active' : ''}
              aria-current={isActive ? 'location' : undefined}
              onClick={() => setMenu(false)}
            >
              <span className="nav-label">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <MagneticButton className="nav-cta" href={isHome ? '#contacto' : '/#contacto'}>
        Hablemos <ArrowUpRight size={15} />
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
    </header>
  );
}


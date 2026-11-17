import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import Brand from './Brand';
import { useContent } from '../ContentContext';
import { useRouter } from '../router';

export default function Footer() {
  const { appearance, profile } = useContent();
  const { path } = useRouter();
  const isHome = path === '/';

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isHome) {
      window.history.pushState(null, '', '#inicio');
    }
  };

  return (
    <footer className="footer">
      <Brand name={appearance.brand} href="/" />
      <a href={isHome ? '#inicio' : '#'} onClick={scrollToTop}>
        Volver arriba <ArrowUpRight size={15} />
      </a>
      <small>
        © {new Date().getFullYear()} {profile.name}
        {profile.isExample ? ' · Contenido' : ''}{' '}
        <a className="admin-entry" href="/admin">
          Administrar
        </a>
      </small>
    </footer>
  );
}


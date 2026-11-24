import { ArrowLeft, Braces } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import Technologies from './Technologies';

export default function AptitudesPage() {
  return <>
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <Header />
    <main id="contenido" className="subpage-main">
      <div className="subpage-hero">
        <div className="subpage-hero-inner">
          <a href="/" className="back-link"><ArrowLeft size={16} /> Volver al inicio</a>
          <div className="subpage-badge"><Braces size={15} /> Mi caja de herramientas</div>
          <h1 className="subpage-title">Aptitudes y <span>tecnologías.</span></h1>
          <p className="subpage-description">Lenguajes, frameworks, herramientas y conocimientos que utilizo en el desarrollo de software, el análisis de datos y la colaboración en proyectos.</p>
        </div>
      </div>
      <Technologies />
    </main>
    <Footer />
  </>;
}

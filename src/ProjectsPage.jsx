import React, { useRef, useState } from 'react';
import { ArrowLeft, FolderGit2 } from 'lucide-react';
import { useContent } from './ContentContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProjectsSection from './components/ProjectsSection';
import ProjectDialog from './components/ProjectDialog';

export default function ProjectsPage() {
  const { projects } = useContent();
  const [selected, setSelected] = useState(null);
  const trigger = useRef(null);

  function openProject(project, element) {
    trigger.current = element;
    setSelected(project);
  }

  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Header activeSection="proyectos" />
      <main id="contenido" className="subpage-main">
        <div className="subpage-hero">
          <div className="subpage-hero-inner">
            <a href="/" className="back-link">
              <ArrowLeft size={16} /> Volver al inicio
            </a>
            <div className="subpage-badge">
              <FolderGit2 size={15} /> Catálogo completo
            </div>
            <h1 className="subpage-title">
              Todos los <span>proyectos.</span>
            </h1>
            <p className="subpage-description">
              Explora en detalle el catálogo completo de proyectos, soluciones web, experimentos y herramientas interactivas. Filtra por categoría o stack tecnológico.
            </p>
          </div>
        </div>
        <ProjectsSection projects={projects} onOpen={openProject} preview={false} />
      </main>
      <Footer />
      <ProjectDialog project={selected} onClose={() => setSelected(null)} triggerRef={trigger} />
    </>
  );
}


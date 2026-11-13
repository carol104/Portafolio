import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import SectionTitle from './SectionHeading';
import ProjectCard from './ProjectCard';
import { m } from '../motion';
import { PROJECT_FILTERS, filterProjects, projectTechOptions } from '../portfolio';

export default function ProjectsSection({ projects, onOpen }) {
  const [category, setCategory] = useState('Todos');
  const [tech, setTech] = useState('Todos');
  const techs = useMemo(() => projectTechOptions(projects), [projects]);
  const filtered = useMemo(() => filterProjects(projects, category, tech), [projects, category, tech]);

  return (
    <section id="proyectos" className="section projects">
      <SectionTitle number="02" kicker="DEL CÓDIGO A LA REALIDAD" text="Una selección de ideas convertidas en interfaces. Cada proyecto, una nueva forma de resolver un problema.">
        Proyectos con <span>propósito.</span>
      </SectionTitle>
      <div className="project-toolbar">
        <div className="filters" role="tablist" aria-label="Filtrar proyectos por categoría">
          {PROJECT_FILTERS.map(item => (
            <button key={item.id} type="button" role="tab" aria-selected={category === item.id} className={category === item.id ? 'selected' : ''} onClick={() => setCategory(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <span>{String(filtered.length).padStart(2, '0')} proyectos</span>
      </div>
      {techs.length > 0 && (
        <div className="filters tech-filters" role="group" aria-label="Filtrar por tecnología">
          <button type="button" className={tech === 'Todos' ? 'selected' : ''} aria-pressed={tech === 'Todos'} onClick={() => setTech('Todos')}>Todo el stack</button>
          {techs.map(item => (
            <button key={item} type="button" className={tech === item ? 'selected' : ''} aria-pressed={tech === item} onClick={() => setTech(item)}>{item}</button>
          ))}
        </div>
      )}
      <m.div className="project-grid" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} index={projects.indexOf(project)} onOpen={onOpen}/>
          ))}
        </AnimatePresence>
      </m.div>
      {!filtered.length && <p className="example-note">No hay proyectos en esta combinación de filtros. Prueba otra categoría o tecnología.</p>}
      {projects.some(p => p.example) && <p className="example-note"><Lightbulb size={15} /> Los proyectos identificados como conceptos son ejemplos de presentación.</p>}
    </section>
  );
}

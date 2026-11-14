import { ArrowUpRight, Users } from 'lucide-react';
import ProjectVisual from './ProjectVisual';
import TechnologyTags from './TechnologyTags';
import SpotlightCard from './SpotlightCard';
import { fadeUp } from '../motion';
import { categoryLabel, isTeamProject } from '../portfolio';

export default function ProjectCard({ project, index, onOpen }) {
  const open = event => onOpen(project, event.currentTarget);
  return (
    <SpotlightCard
      className="project-card"
      variants={fadeUp}
      layout
      layoutId={`project-${project.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <button className="project-cover" type="button" aria-label={`Ver detalles de ${project.title}`} onClick={open}>
        <ProjectVisual project={project}/>
        <span className="cover-arrow"><ArrowUpRight size={22} aria-hidden="true"/></span>
        {project.example && <span className="example-label">Concepto de ejemplo</span>}
      </button>
      <div className="project-content">
      <div className="project-meta">
        <span>{project.type}</span>
        <small>{String(index + 1).padStart(2, '0')}</small>
      </div>
      <p className="project-category">{categoryLabel(project.category)}</p>
      <h3><button type="button" className="project-title" onClick={open}>{project.title}<ArrowUpRight size={22} aria-hidden="true"/></button></h3>
      <p>{project.subtitle}</p>
      <p className="project-problem">{project.description}</p>
      <TechnologyTags items={project.tech}/>
      {isTeamProject(project) && (
        <p className="project-credits"><Users size={15} aria-hidden="true"/> {project.collaborators?.trim() || 'Añade créditos de colaboradores'}</p>
      )}
      </div>
    </SpotlightCard>
  );
}

import { useEffect, useRef } from 'react';
import { ExternalLink as ExternalLinkIcon, Github, Users, X } from 'lucide-react';
import ExternalLink from './ExternalLink';
import ProjectVisual from './ProjectVisual';
import TechnologyTags from './TechnologyTags';
import { categoryLabel, isTeamProject } from '../portfolio';

export default function ProjectDialog({ project, onClose, triggerRef }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (project) {
      dialog.current.showModal();
      dialog.current.focus();
    } else if (dialog.current.open) {
      dialog.current.close();
      triggerRef.current?.focus();
    }
  }, [project, triggerRef]);

  return (
    <dialog ref={dialog} className="project-dialog" aria-labelledby="project-dialog-title" tabIndex={-1}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === dialog.current) onClose(); }}>
      {project && <>
        <button className="dialog-close" type="button" aria-label="Cerrar detalles" onClick={onClose}><X/></button>
        <ProjectVisual project={project} large/>
        <div className="dialog-body">
          <p className="eyebrow">{project.example ? 'CONCEPTO DE EJEMPLO' : 'PROYECTO'} · {categoryLabel(project.category)}</p>
          <h2 id="project-dialog-title">{project.title}</h2>
          <p>{project.description}</p>
          <h3>Mi contribución</h3>
          <p>{project.contribution}</p>
          {isTeamProject(project) && (
            <div className="dialog-credits">
              <h3><Users size={18} aria-hidden="true"/> Créditos / Colaboradores</h3>
              <p>{project.collaborators?.trim() || 'Añade aquí a las personas que colaboraron en este proyecto.'}</p>
            </div>
          )}
          <TechnologyTags items={project.tech}/>
          <div className="dialog-links">
            {project.url && <ExternalLink className="button primary" href={project.url}>Demo en vivo / Video <ExternalLinkIcon size={18}/></ExternalLink>}
            {project.github && <ExternalLink className="button secondary" href={project.github}><Github size={18}/> Repositorio</ExternalLink>}
          </div>
          {!project.url && !project.github && <p className="example-note">Todavía no hay enlaces de demo o repositorio disponibles.</p>}
        </div>
      </>}
    </dialog>
  );
}

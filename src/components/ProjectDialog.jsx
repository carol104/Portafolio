import { useEffect, useRef } from 'react';
import { ExternalLink as ExternalLinkIcon, Users, X } from 'lucide-react';
import ExternalLink from './ExternalLink';
import ProjectRepositories from './ProjectRepositories';
import ProjectCollaborators from './ProjectCollaborators';
import ProjectVisual from './ProjectVisual';
import TechnologyTags from './TechnologyTags';
import { categoryLabel, isTeamProject, projectRepositories } from '../portfolio';

export default function ProjectDialog({ project, onClose, triggerRef }) {
  const repositories = project ? projectRepositories(project) : [];
  const dialog = useRef(null);
  useEffect(() => {
    if (project) {
      dialog.current.showModal();
      dialog.current.focus();
      dialog.current.querySelector('.dialog-scroll')?.scrollTo({ top: 0 });
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
        <div className="dialog-scroll">
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
              <ProjectCollaborators project={project}/>
            </div>
          )}
          <TechnologyTags items={project.tech}/>
          <div className="dialog-links">
            {project.url && <ExternalLink className="button primary" href={project.url}>Demo en vivo / Video <ExternalLinkIcon size={18}/></ExternalLink>}
            <ProjectRepositories project={project}/>
          </div>
          {!project.url && !repositories.length && <p className="example-note">Todavía no hay enlaces de demo o repositorio disponibles.</p>}
        </div>
        </div>
      </>}
    </dialog>
  );
}

import { Github } from 'lucide-react';
import ExternalLink from './ExternalLink';

export default function ProjectCollaborators({ project }) {
  const collaborators = project.collaboratorLinks || [];
  return <>
    {project.collaborators?.trim() && <p className="project-collaborator-note">{project.collaborators}</p>}
    {collaborators.length > 0 && <ul className="project-collaborators">
      {collaborators.map((person, index) => <li key={index}>
        {person.github ? <ExternalLink href={person.github} aria-label={`GitHub de ${person.name}`}><Github size={15} aria-hidden="true" />{person.name}</ExternalLink> : <span>{person.name}</span>}
      </li>)}
    </ul>}
  </>;
}

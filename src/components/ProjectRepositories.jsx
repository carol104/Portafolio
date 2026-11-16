import { Github } from 'lucide-react';
import ExternalLink from './ExternalLink';
import { projectRepositories } from '../portfolio';

export default function ProjectRepositories({ project }) {
  const repositories = projectRepositories(project);
  if (!repositories.length) return null;
  if (repositories.length === 1) return (
    <ExternalLink className="project-github" href={repositories[0].url} aria-label={`Repositorio de GitHub de ${project.title}`} title="Ver repositorio en GitHub">
      <Github size={20} aria-hidden="true" />
    </ExternalLink>
  );
  return <div className="project-repositories" role="group" aria-label={`Repositorios de ${project.title}`}>
    <div className="project-repositories-heading"><Github size={21} aria-hidden="true"/><span className="sr-only">Repositorios de GitHub</span></div>
    <ul>{repositories.map((repository, index) => <li key={index}>
      <ExternalLink href={repository.url}><Github size={15} aria-hidden="true"/>{repository.name}</ExternalLink>
    </li>)}</ul>
  </div>;
}

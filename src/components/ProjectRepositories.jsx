import { Github } from 'lucide-react';
import ExternalLink from './ExternalLink';
import { projectRepositories, formatCommitDate } from '../portfolio';

export default function ProjectRepositories({ project, showCommitDates = false }) {
  const repositories = projectRepositories(project);
  if (!repositories.length) return null;
  if (repositories.length === 1) return (
    <ExternalLink className="project-github" href={repositories[0].url} aria-label={`Repositorio de GitHub de ${project.title}`} title="Ver repositorio en GitHub">
      <Github size={20} aria-hidden="true" />
    </ExternalLink>
  );
  return <div className="project-repositories" role="group" aria-label={`Repositorios de ${project.title}`}>
    <h4 className="project-repositories-heading"><Github size={21} aria-hidden="true"/><span>Repositorios</span></h4>
    <ul>{repositories.map((repository, index) => <li key={index}>
      <ExternalLink href={repository.url}><Github size={15} aria-hidden="true"/>{repository.name}</ExternalLink>
      {showCommitDates && formatCommitDate(repository.lastCommitAt) && <small className="repository-commit">Último commit: <ExternalLink href={repository.lastCommitUrl || repository.url}><time dateTime={repository.lastCommitAt}>{formatCommitDate(repository.lastCommitAt)}</time></ExternalLink></small>}
    </li>)}</ul>
  </div>;
}

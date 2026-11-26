import {GitCommitHorizontal} from 'lucide-react';
import ExternalLink from './ExternalLink';
import {projectLastCommit, formatCommitDate} from '../portfolio';

export default function ProjectCommitDate({project}) {
  const commit = projectLastCommit(project);
  if (!commit) return null;
  return <p className="project-updated"><GitCommitHorizontal size={15} aria-hidden="true"/><span>Último commit: <ExternalLink href={commit.lastCommitUrl || commit.url} title="Ver commit en GitHub · fecha de Ecuador"><time dateTime={commit.lastCommitAt}>{formatCommitDate(commit.lastCommitAt)}</time></ExternalLink></span></p>;
}

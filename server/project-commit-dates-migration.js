import commitDates from './project-commit-dates.json' with {type: 'json'};
import {migrateProjectDetails, repositoryIdentity} from './project-details-migration.js';
import {projectRepositories} from '../src/portfolio.js';

// GitHub commits API snapshot, checked 2026-11-25. Use committer.date, not
// repository pushed_at (which may refer to another branch or a non-commit push).
export function addProjectCommitDates(project) {
  let changed = false;
  const repositories = projectRepositories(project).map(repository => {
    let branch = '';
    try {
      const parts = new URL(repository.url).pathname.split('/').filter(Boolean);
      if (parts[2] === 'tree') branch = decodeURIComponent(parts.slice(3).join('/'));
      else if (parts.length > 2) return repository;
    } catch { return repository; }
    const details = commitDates.find(item => item.repository.toLowerCase() === repositoryIdentity(repository.url) && item.branch === branch);
    if (!details) return repository;
    const {lastCommitAt, lastCommitUrl} = details;
    if (repository.lastCommitAt === lastCommitAt && repository.lastCommitUrl === lastCommitUrl) return repository;
    changed = true;
    return {...repository, lastCommitAt, lastCommitUrl};
  });
  return changed ? {...project, repositories} : project;
}

export function migrateProjectCommitDates(pool) {
  return migrateProjectDetails(pool, {migration: '2026-11-25-project-last-commits', transform: addProjectCommitDates});
}

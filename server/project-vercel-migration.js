import {migrateProjectDetails, repositoryIdentity} from './project-details-migration.js';

const repositories = new Set([
  'josuegarciaabata/team-corporate',
  'joelbonillag/iron_zone_odoo_das',
  'davidjosuep2/banking-credit-investment-simulator',
]);

export function addProjectVercel(project) {
  const links = [project.github, ...(project.repositories || []).map(item => item.url)];
  if (!links.some(link => repositories.has(repositoryIdentity(link)))) return project;
  if ((project.tech || []).some(item => item.toLowerCase() === 'vercel')) return project;
  return {...project, tech: [...(project.tech || []), 'Vercel']};
}

export function migrateProjectVercel(pool) {
  return migrateProjectDetails(pool, {migration: '2026-11-three-projects-vercel', transform: addProjectVercel});
}

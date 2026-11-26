import { migrateProjectDetails, repositoryIdentity } from './project-details-migration.js';

// Verified against main on 2026-11-25: README, dependency manifests,
// Team Corporate's blog service and Iron Zone's event models and views.
export const verifiedTeamProjectDetails = [
  {
    repository: 'JosueGarciaAbata/team-corporate',
    demo: 'https://stratium-web.vercel.app',
    subtitle: 'Sitio corporativo de Stratium con servicios, proyectos y blog.',
    type: 'Sitio web corporativo',
    tech: ['Angular', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'RxJS', 'GSAP', 'EmailJS', 'Vercel'],
    description: 'Sitio corporativo de Stratium que presenta los servicios, proyectos y equipo de una empresa de desarrollo de software. Integra páginas de inicio, contacto y contenido legal, además de un blog sobre ingeniería de software y herramientas tecnológicas. El blog organiza las publicaciones por categorías y autores, con artículos relacionados, índice de secciones y contenido multimedia. Su servicio combina artículos precargados con publicaciones de usuario almacenadas en localStorage. Está construido con Angular y TypeScript, con diseño adaptable y animaciones mediante GSAP.',
  },
  {
    repository: 'JoelBonillaG/iron_zone_odoo_das',
    subtitle: 'Gestión de gimnasio, membresías y clases en una sola plataforma.',
    type: 'Aplicación web en Odoo',
    tech: ['Odoo', 'Python', 'PostgreSQL', 'XML', 'QWeb', 'JavaScript', 'CSS', 'SCSS', 'Docker', 'Docker Compose', 'Playwright', 'GitHub Actions', 'Vercel'],
    description: 'Sistema de gestión de gimnasio construido sobre Odoo 18 con módulos nativos y complementos personalizados. Centraliza el sitio web, la tienda de productos y membresías, las suscripciones con facturación periódica, el inventario y las ventas. Permite publicar clases y eventos, asignar entrenadores, definir horarios, salas, dificultad y cupos, y gestionar inscripciones y beneficios según el plan contratado. Incluye guías de ejercicios, un portal para clientes y módulos de facturación electrónica y retenciones para Ecuador. Utiliza PostgreSQL y un entorno de despliegue con Docker Compose.',
  },
];

export function completeTeamProjectDetails(project) {
  const links = [project.github, ...(project.repositories || []).map(item => item.url)];
  const details = verifiedTeamProjectDetails.find(item => links.some(link => repositoryIdentity(link) === item.repository.toLowerCase()));
  if (!details) return project;
  const { repository, demo, ...fields } = details;
  return { ...project, ...structuredClone(fields), example: false, ...(demo && !project.url ? { url: demo } : {}) };
}

// Separate marker: updating these two projects must not overwrite later edits
// to the six projects completed in the preceding publication.
export function migrateTeamProjectDetails(pool) {
  return migrateProjectDetails(pool, { migration: '2026-11-verified-team-project-details-v1', transform: completeTeamProjectDetails });
}

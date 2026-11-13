export const PROJECT_CATEGORIES = ['Personal', 'Colaboración', 'Clientes', 'Open Source'];

export const PROJECT_FILTERS = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Personal', label: 'Proyectos Personales (Individuales)' },
  { id: 'Colaboración', label: 'Proyectos en Equipo / Colaborativos' },
  { id: 'Clientes', label: 'Proyectos para Clientes / Empresas' },
  { id: 'Open Source', label: 'Aportes / Open Source' },
];

export const COURSE_KINDS = ['Curso', 'Certificación', 'Evento'];
export const INTEREST_ICONS = ['terminal', 'database', 'compass', 'music', 'game', 'idea', 'camera', 'bird'];
export const PREVIEW_STYLES = ['orbit', 'store', 'analytics', 'hack'];

export function filterProjects(projects, category, tech) {
  return projects.filter(project =>
    (category === 'Todos' || project.category === category) &&
    (tech === 'Todos' || (project.tech || []).includes(tech)),
  );
}

export function projectTechOptions(projects) {
  return [...new Set(projects.flatMap(project => project.tech || []))];
}

export function isTeamProject(project) {
  return project.category === 'Colaboración' || Boolean(project.collaborators?.trim());
}

export function categoryLabel(category) {
  return PROJECT_FILTERS.find(item => item.id === category)?.label || category;
}

export const placeholderCourses = [];

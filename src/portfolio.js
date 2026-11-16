export const PROJECT_CATEGORIES = ['Personal', 'Colaboración', 'Clientes', 'Open Source'];

export const PROJECT_FILTERS = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Personal', label: 'Proyectos Personales (Individuales)' },
  { id: 'Colaboración', label: 'Proyectos en Equipo / Colaborativos' },
  { id: 'Clientes', label: 'Proyectos para Clientes / Empresas' },
  { id: 'Open Source', label: 'Aportes / Open Source' },
];

export const COURSE_KINDS = ['Curso', 'Certificación', 'Evento'];
export const COURSE_FILTERS = [['Todos', 'Todos'], ['Curso', 'Cursos'], ['Certificación', 'Certificaciones'], ['Evento', 'Eventos']];
export const COURSE_MODALITIES = ['Online', 'Presencial', 'Híbrida'];
export const COURSE_STATUSES = ['Próximamente', 'En curso', 'Finalizado'];
export function filterCourses(courses, kind) {
  return courses.filter(course => kind === 'Todos' || (course.kind || 'Curso') === kind);
}
export const PLATFORMS = ['Cisco', 'Udemy', 'Otro'];
export const INTEREST_ICONS = ['terminal', 'database', 'compass', 'music', 'game', 'idea', 'camera', 'bird', 'nature', 'sports'];
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

export function projectRepositories(project) {
  if (Array.isArray(project.repositories)) return project.repositories;
  return project.github ? [{ name: '', url: project.github }] : [];
}

export function isTeamProject(project) {
  return project.category === 'Colaboración' || Boolean(project.collaborators?.trim()) || Boolean(project.collaboratorLinks?.length);
}

export function categoryLabel(category) {
  return PROJECT_FILTERS.find(item => item.id === category)?.label || category;
}

export const placeholderCourses = [];

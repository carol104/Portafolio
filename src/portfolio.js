export const PROJECT_CATEGORIES = ['Personal', 'Colaboración', 'Clientes', 'Open Source'];

export const PROJECT_CATEGORY_LABELS = {
  Personal: 'Personal (Individual)',
  Colaboración: 'Colaboración (En equipo)',
  Clientes: 'Clientes / Empresas',
  'Open Source': 'Aportes / Open Source',
};

export const PROJECT_FILTERS = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Colaborativo', label: 'Colaborativo' },
  { id: 'Individual', label: 'Individual' },
];

export const COURSE_KINDS = ['Curso', 'Certificación', 'Evento'];
export const COURSE_FILTERS = [
  ['Todos', 'Todos'],
  ['Curso', 'Cursos'],
  ['Evento', 'Eventos'],
];
export const COURSE_MODALITIES = ['Online', 'Presencial', 'Híbrida'];
export const COURSE_STATUSES = ['Próximamente', 'En curso', 'Finalizado'];

export function filterCourses(courses, kind) {
  return (courses || []).filter(course => kind === 'Todos' || (course.kind || 'Curso') === kind);
}

export const PLATFORMS = ['Cisco', 'Udemy', 'Otro'];
export const INTEREST_ICONS = ['terminal', 'database', 'compass', 'music', 'game', 'idea', 'camera', 'bird', 'nature', 'sports'];
export const PREVIEW_STYLES = ['orbit', 'store', 'analytics', 'hack'];

export function isTeamProject(project) {
  return (
    project.category === 'Colaboración' ||
    project.category === 'Colaborativo' ||
    project.category === 'Open Source' ||
    Boolean(project.collaborators?.trim()) ||
    Boolean(project.collaboratorLinks?.length)
  );
}

export function filterProjects(projects, category, tech) {
  return (projects || []).filter(project => {
    let matchCategory = true;
    if (!category || category === 'Todos') {
      matchCategory = true;
    } else if (category === 'Colaborativo' || category === 'Colaborativos') {
      matchCategory = isTeamProject(project);
    } else if (category === 'Individual' || category === 'Individuales') {
      matchCategory = !isTeamProject(project);
    } else {
      matchCategory = project.category === category;
    }

    const matchTech = !tech || tech === 'Todos' || (project.tech || []).includes(tech);
    return matchCategory && matchTech;
  });
}

export function projectTechOptions(projects) {
  return [...new Set((projects || []).flatMap(project => project.tech || []))].filter(Boolean);
}

export function projectRepositories(project) {
  if (Array.isArray(project.repositories)) return project.repositories;
  return project.github ? [{ name: '', url: project.github }] : [];
}

export function projectLastCommit(project) {
  return projectRepositories(project).filter(repository => repository.lastCommitAt && Number.isFinite(Date.parse(repository.lastCommitAt)))
    .reduce((latest, repository) => !latest || Date.parse(repository.lastCommitAt) > Date.parse(latest.lastCommitAt) ? repository : latest, null);
}

export function formatCommitDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return '';
  return new Intl.DateTimeFormat('es-EC', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Guayaquil'}).format(new Date(value));
}

export function categoryLabel(category) {
  return PROJECT_CATEGORY_LABELS[category] || PROJECT_FILTERS.find(item => item.id === category)?.label || category;
}

export const placeholderCourses = [];

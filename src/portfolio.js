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

export const placeholderCourses = [
  {
    id: 'cisco-placeholder',
    title: 'Curso de redes (Cisco Networking Academy)',
    institution: 'Cisco Networking Academy',
    period: 'Añade la fecha de aprobación',
    description: 'Placeholder: completa el nombre exacto del curso, las horas o la fecha y el enlace a tu credencial.',
    url: '',
    tech: ['Networking'],
    kind: 'Curso',
    credential: 'ID de credencial',
    placeholder: true,
    visible: true,
  },
  {
    id: 'cert-placeholder',
    title: 'Certificación por documentar',
    institution: 'Institución emisora',
    period: 'Añade el año',
    description: 'Placeholder: describe la certificación, el alcance y cómo verificarla.',
    url: '',
    tech: [],
    kind: 'Certificación',
    credential: 'Código o badge',
    placeholder: true,
    visible: true,
  },
  {
    id: 'event-placeholder',
    title: 'Hackathon o evento tecnológico',
    institution: 'Organizador del evento',
    period: 'Añade la fecha',
    description: 'Placeholder: documenta el evento, tu rol, el equipo y el resultado.',
    url: '',
    tech: ['Trabajo en equipo'],
    kind: 'Evento',
    credential: '',
    placeholder: true,
    visible: true,
  },
];

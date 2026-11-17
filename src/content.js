// Reemplaza los ejemplos con información verificada antes de publicar.
import { placeholderCourses } from './portfolio.js';
export const professionalLinks = { linkedin: 'https://www.linkedin.com/in/carol-cañizares-villacís-1518833ba/' };
export const profile = {
  name: 'Carol', initials: 'C', role: 'Desarrolladora Full Stack', location: 'Tu ciudad, Ecuador',
  email: 'carol.28427@gmail.com', github: 'https://github.com/carol104', linkedin: professionalLinks.linkedin, available: true, isExample: true,
  objective: 'Quiero transformar ideas en productos digitales útiles, combinando interfaces cuidadas con un backend sólido. Busco un equipo donde aportar, aprender y construir con propósito.',
  about: 'Me interesa todo el recorrido de una idea: entender el problema, diseñar una solución y llevarla a la web. Mi enfoque conecta el detalle visual con la lógica que hace que todo funcione.',
  education: { title: 'Ingeniería de Software', institution: 'Tu universidad o institución', period: 'Añade aquí el período de estudio' },
};
export const technologyGroups = [
  { title: 'Lenguajes', description: 'La base para construir soluciones.', icon: 'code', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'PHP', 'C#'] },
  { title: 'Frontend', description: 'Interfaces web y móviles que conectan con las personas.', icon: 'frontend', items: ['React', 'Angular', 'Ionic', 'Vite', 'Tailwind CSS'] },
  { title: 'Backend', description: 'Lógica, servicios y aplicaciones web.', icon: 'backend', items: ['Spring Boot', 'Laravel', 'ASP.NET Core', 'Express', 'Node.js'] },
  { title: 'Data y Business Intelligence', description: 'Información organizada, análisis y visualización de datos.', icon: 'database', items: ['SQL Server', 'Oracle', 'PostgreSQL', 'MongoDB', 'Power BI', 'Grafana'] },
  { title: 'Calidad y pruebas', description: 'Automatización, análisis de código y pruebas de software.', icon: 'quality', items: ['Selenium', 'Playwright', 'pytest', 'SonarQube', 'JUnit'] },
  { title: 'CI/CD y despliegue', description: 'Integración continua y publicación de aplicaciones.', icon: 'deploy', items: ['Docker', 'Jenkins', 'Heroku', 'Railway'] },
];
export const technologies = technologyGroups.flatMap(group => group.items);
export const projects = [
  { id: 'orbit', title: 'Orbit', subtitle: 'Un espacio para que las ideas avancen.', category: 'Personal', type: 'PRODUCTIVIDAD', tech: ['React', 'Express', 'PostgreSQL'], style: 'orbit', description: 'Problema: las ideas se dispersan entre notas y chats. Solución: un espacio para organizar proyectos, visualizar tareas y colaborar desde un solo lugar.', contribution: 'Ejemplo de alcance: diseño de interfaz, componentes de React y API de proyectos.', collaborators: '', github: '', url: '', example: true },
  { id: 'nexo', title: 'Nexo Store', subtitle: 'Una experiencia de compra más simple.', category: 'Clientes', type: 'E-COMMERCE', tech: ['React', 'Node.js', 'PostgreSQL'], style: 'store', description: 'Problema: un catálogo difícil de explorar en móvil. Solución: una tienda digital con filtros claros y un flujo de compra adaptable.', contribution: 'Ejemplo de alcance: catálogo, carrito y modelo de datos. Sustituye este caso por un trabajo real para un cliente.', collaborators: '', github: '', url: '', example: true },
  { id: 'pulse', title: 'Pulse Analytics', subtitle: 'Datos claros. Mejores decisiones.', category: 'Colaboración', type: 'DASHBOARD', tech: ['React', 'Express', 'CSS'], style: 'analytics', description: 'Problema: indicadores dispersos y difíciles de leer. Solución: un panel para explorar métricas y detectar patrones con visualizaciones claras.', contribution: 'Ejemplo de aporte: componentes de visualización y diseño responsive. Identifica aquí tu contribución real al equipo.', collaborators: 'Añade aquí a tus colaboradores', github: '', url: '', example: true },
  { id: 'hack', title: 'Build Together', subtitle: 'De una idea a un prototipo en equipo.', category: 'Open Source', type: 'EXPERIMENTACIÓN', tech: ['React', 'Supabase', 'Git'], style: 'hack', description: 'Problema: los prototipos de hackathon se pierden al terminar el evento. Solución: un espacio para documentar aprendizajes, exploraciones con Supabase y trabajo en comunidad.', contribution: 'Interés por explorar; no representa participación ni premios en un evento real.', collaborators: 'Comunidad / equipo del evento', github: '', url: '', example: true }
];
export const experience = [
  { type: 'EMPRESA', title: 'Tu siguiente experiencia', place: 'Empresa · Cargo · Período', text: 'Describe aquí una experiencia real: el problema que resolviste, tus responsabilidades y un resultado que puedas demostrar.' },
  { type: 'INDEPENDIENTE', title: 'Soluciones para clientes', place: 'Cliente · Proyecto · Período', text: 'Añade un trabajo realizado, tu aportación y las tecnologías que utilizaste. Puedes omitir esta sección si todavía no aplica.' },
  { type: 'APRENDIZAJE', title: 'Construir, compartir, mejorar', place: 'Proyectos propios y colaboración', text: 'Documenta tus proyectos personales, contribuciones de código abierto y aprendizajes. El proceso también cuenta una historia.' }
];
export const interests = [
  { id: 'hackathons', icon: 'terminal', title: 'Hackatones', description: 'Ideas, prototipos y el reto de construir en equipo.', visible: true },
  { id: 'opensource', icon: 'database', title: 'Supabase & open source', description: 'Explorar herramientas y aprender compartiendo.', visible: true },
  { id: 'nature', icon: 'nature', title: 'Naturaleza', description: 'Disfruto de la naturaleza y de pasar tiempo al aire libre.', visible: true },
  { id: 'birds', icon: 'bird', title: 'Observación de aves', description: 'Paciencia, detalle y una forma de mirar distinto.', visible: true },
  { id: 'photo', icon: 'camera', title: 'Fotografía', description: 'Componer luz, color y momento fuera de la pantalla.', visible: true },
  { id: 'sports', icon: 'sports', title: 'Deportes', description: 'Me gusta jugar fútbol y básquet para mantenerme activa y compartir en equipo.', visible: true },
];
export const initialContent = {
  profile: { ...profile, resumeUrl: '', showEducation: true },
  projects: projects.map(project => ({ ...project, visible: true, image: '' })),
  technologyGroups: technologyGroups.map((group, index) => ({ ...group, id: `group-${index}`, visible: true })),
  experience: experience.map((item, index) => ({ ...item, id: `experience-${index}`, visible: true })),
  courses: placeholderCourses, interests,
  appearance: { brand: 'dev.folio', headline: 'Convierto ideas\nen aplicaciones\n', summary: 'Desarrollo aplicaciones web y móviles para automatizar procesos de la vida cotidiana.', accent: '#82aff7', background: '#080f21' },
};

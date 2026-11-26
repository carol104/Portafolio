export const technologyGroups = [
  { title: 'Lenguajes', description: 'La base para construir soluciones.', icon: 'code', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'PHP', 'C#', 'XML'] },
  { title: 'Frontend y móvil', description: 'Interfaces web y móviles que conectan con las personas.', icon: 'frontend', items: ['HTML', 'CSS', 'React.js', 'Angular', 'Ionic Framework', 'React Native', 'Expo', 'Blazor', 'Bootstrap', 'jQuery', 'Tailwind CSS', 'Vite'] },
  { title: 'Backend', description: 'Lógica, servicios y aplicaciones web.', icon: 'backend', items: ['Spring Boot', 'Laravel', 'ASP.NET', 'Express.js', 'Node.js', 'Prisma', 'Java Servlet', 'Tomcat', 'Odoo'] },
  { title: 'Bases de datos', description: 'Almacenamiento y consulta de información.', icon: 'database', items: ['MySQL', 'SQL Server', 'Oracle Database', 'PostgreSQL', 'MongoDB'] },
  { title: 'Calidad y pruebas', description: 'Automatización, estándares y calidad del software.', icon: 'quality', items: ['Selenium', 'Playwright', 'Pytest', 'SonarQube', 'JUnit', 'Normas ISO'] },
  { title: 'CI/CD y despliegue', description: 'Integración continua y publicación de aplicaciones.', icon: 'deploy', items: ['Docker', 'Jenkins', 'Railway', 'Cloudflare', 'Firebase'] },
  { title: 'Arquitectura y desarrollo', description: 'Diseño de soluciones y servicios conectados.', icon: 'backend', items: ['Arquitectura orientada a servicios (SOA)', 'Desarrollo de API', 'Microservicios', 'Desarrollo de Software'] },
  { title: 'Datos y análisis', description: 'Análisis, visualización y fundamentos de ciencia de datos.', icon: 'database', items: ['Análisis de datos', 'Ciencia de datos', 'Power BI', 'Grafana'] },
  { title: 'Administración e integración de datos', description: 'Herramientas para administrar e integrar bases de datos.', icon: 'database', items: ['SQL Server Management Studio', 'SQL Server Integration Services (SSIS)', 'PhpMyAdmin'] },
  { title: 'Herramientas de desarrollo', description: 'Entornos, control de versiones y creación de prototipos.', icon: 'code', items: ['Eclipse', 'Git', 'GitHub', 'Vercel V0', 'n8n'] },
  { title: 'Gestión y colaboración', description: 'Organización del trabajo y seguimiento de proyectos.', icon: 'quality', items: ['Scrum', 'Trello', 'JIRA', 'Notion'] },
  { title: 'Sistemas y seguridad', description: 'Sistemas operativos, soporte y seguridad de redes.', icon: 'deploy', items: ['Linux', 'Seguridad de redes', 'Cyberseguridad'] },
];

export const normalizeTechnology = name => name.toLowerCase().replace(/[\s._-]/g, '');
const aliases = { react: 'React.js', express: 'Express.js', ionic: 'Ionic Framework', oracle: 'Oracle Database', css3: 'CSS' };
export const canonicalTechnology = name => aliases[normalizeTechnology(name)] || name;

// IDs of the original groups remain stable for existing admin content.
export const catalogGroups = technologyGroups.map((group, index) => ({ ...group, id: `group-${index}`, visible: true }));

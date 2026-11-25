// Verified against the public repositories on 2026-11-25. ReciclApp uses
// feature/notificaciones; the other projects use main. Match repository identity,
// never the seed IDs (the owner has reused those IDs for different projects).
export const verifiedProjectDetails = [
  {
    repository: 'AdrianMora8/UTAxi',
    subtitle: 'Viajes compartidos para la comunidad universitaria de la UTA.',
    type: 'Aplicación web y móvil',
    tech: ['React', 'React Native', 'Expo', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Socket.IO', 'Tailwind CSS', 'Docker', 'Vitest', 'Playwright'],
    description: 'Plataforma de movilidad universitaria que conecta a conductores y pasajeros de la Universidad Técnica de Ambato. Permite registrarse con correo institucional y verificación por código, publicar y buscar viajes, gestionar cupos y solicitudes, consultar el recorrido con ubicación en tiempo real y calificar a otros usuarios. Incluye pagos con Stripe, recuperación de contraseña y un panel administrativo para gestionar usuarios y reportes. Cuenta con clientes web y móvil y pruebas automatizadas.',
  },
  {
    repository: 'carol104/PrioTask',
    subtitle: 'Organiza tus materias y decide qué tarea atender primero.',
    type: 'Aplicación web',
    tech: ['React', 'JavaScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Nginx'],
    description: 'Gestor académico que organiza materias, tareas, proyectos y subtareas en una lista priorizada y un tablero Kanban. Calcula una prioridad dinámica según la cercanía de la entrega, la calificación de la materia, el peso de la actividad y el avance del proyecto. Incluye edición de notas, indicadores de progreso y un temporizador Pomodoro para planificar sesiones de estudio. Integra una API REST y persistencia en PostgreSQL, con despliegue mediante Docker Compose.',
  },
  {
    repository: 'carol104/ReciclApp',
    branch: 'feature/notificaciones',
    subtitle: 'Reciclaje, solicitudes de recolección y alertas ciudadanas.',
    type: 'Aplicación móvil y panel web',
    tech: ['React Native', 'Expo', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'AsyncStorage', 'HTML', 'CSS', 'JavaScript', 'Expo Push API', 'node-cron'],
    description: 'Prototipo de reciclaje con aplicación móvil y panel web administrativo. La app permite registrar solicitudes por material, peso, dirección y horario, consultar el historial y simular entregas, puntos y canjes de recompensas con almacenamiento local por usuario. Abre búsquedas de centros de reciclaje en Google Maps. La rama de notificaciones incorpora un servicio administrativo para crear, editar, cancelar y programar alertas con severidad, etiquetas y caducidad, además de registrar tokens y enviar mensajes mediante Expo Push API. El repositorio también incluye un backend de autenticación con PostgreSQL. Las recolecciones y recompensas de la app son demostraciones locales.',
  },
  {
    repository: 'carol104/DinoPet',
    subtitle: 'Adopta un dinosaurio y cuida sus necesidades en tiempo real.',
    type: 'Juego de escritorio',
    tech: ['Java', 'Swing', 'AWT', 'Apache Ant'],
    description: 'Mascota virtual de escritorio en la que cuidas a un dinosaurio desde su nacimiento. Debes alimentarlo, jugar, hacerlo dormir, asearlo y curarlo para mantener sus niveles de hambre, sueño, felicidad, salud y limpieza. Las necesidades cambian con el tiempo y las acciones trasladan al dinosaurio entre distintos escenarios. Su comportamiento se organiza con los patrones State y Singleton, y la interfaz Swing muestra barras de estado, animaciones y pantallas de nacimiento y fin del juego.',
  },
  {
    repository: 'carol104/Wild-Store',
    subtitle: 'Adopta un tigre, un león o un mono y cuídalo en la selva.',
    type: 'Juego web',
    tech: ['JavaScript', 'HTML', 'CSS'],
    description: 'Juego de mascota virtual para navegador en el que eliges y nombras un tigre, un león o un mono. El hambre, el sueño, la felicidad y la limpieza cambian en tiempo real y se atienden alimentando, descansando, jugando y bañando a la mascota. Incluye imágenes que responden a su estado, música con controles de reproducción y volumen, y una pantalla de fin de juego con reinicio. Está construido con JavaScript nativo y programación orientada a objetos, aplicando State, Strategy, Observer y Factory con Singleton. Guarda el nombre y la especie en localStorage.',
  },
  {
    repository: 'DavidJosueP2/Banking-Credit-Investment-Simulator',
    subtitle: 'Compara créditos e inversiones con simulaciones detalladas.',
    type: 'Aplicación web',
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Java', 'Spring Boot', 'Spring Security', 'Spring Data JPA', 'PostgreSQL', 'Flyway', 'Gradle', 'Docker'],
    description: 'Sistema web para simular créditos e inversiones a partir de productos, tasas, plazos, seguros y cargos configurables. El módulo de créditos genera tablas de amortización con los sistemas francés y alemán, permite evaluar la capacidad de pago y exportar resultados a PDF y Excel. Incluye simulación de inversiones y gestión de solicitudes en línea, además de paneles administrativos con roles y permisos para clientes, asesores y analistas. Combina una interfaz React con una API Java y Spring Boot y persistencia en PostgreSQL.',
  },
];

function repositoryIdentity(value) {
  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() !== 'github.com') return '';
    return url.pathname.split('/').filter(Boolean).slice(0, 2).join('/').replace(/\.git$/i, '').toLowerCase();
  } catch {
    return '';
  }
}

export function completeProjectDetails(project) {
  const links = [project.github, ...(project.repositories || []).map(item => item.url)];
  const details = verifiedProjectDetails.find(item => links.some(link => repositoryIdentity(link) === item.repository.toLowerCase()));
  if (!details) return project;
  const { repository, branch, ...fields } = details;
  const next = { ...project, ...structuredClone(fields), example: false };
  // Full DinoPet authorship was confirmed by the owner during this update.
  if (repository === 'carol104/DinoPet') {
    if (!next.contribution || /^Ejemplo de aporte:/.test(next.contribution)) {
      next.contribution = 'Desarrollo completo del juego: interfaz de escritorio en Java Swing, lógica de cuidado del dinosaurio, estados de la mascota y transiciones entre escenarios.';
    }
    if (!next.collaborators && !next.collaboratorLinks?.length) next.category = 'Personal';
  }
  if (repository === 'AdrianMora8/UTAxi') {
    if (!next.url) next.url = 'https://ut-axi.vercel.app';
    next.contribution = (next.contribution || '').replace('intrgración', 'integración').replace('en docker', 'en Docker');
  }
  if (branch) {
    const branchUrl = `https://github.com/${repository}/tree/${branch}`;
    next.repositories = (project.repositories?.length ? project.repositories : [{ name: 'Repositorio', url: project.github }]).map(item =>
      repositoryIdentity(item.url) === repository.toLowerCase() ? { ...item, url: branchUrl } : item
    );
    if (repositoryIdentity(project.github) === repository.toLowerCase()) next.github = branchUrl;
  }
  return next;
}

export async function migrateProjectDetails(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187423)');
    const migration = '2026-11-verified-project-details-v1';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const { rows } = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const projects = (data.projects || []).map(completeProjectDetails);
        if (JSON.stringify(projects) !== JSON.stringify(data.projects)) {
          data.projects = projects;
          await client.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1', [JSON.stringify(data)]);
        }
      }
      await client.query('INSERT INTO content_migrations(id) VALUES($1)', [migration]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

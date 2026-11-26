// Learning summaries use the existing course information and provider outlines:
// netacad.com/courses/data-science-essentials-with-python
// netacad.com/courses/introduction-iot
// netacad.com/courses/network-support-security
// netdevgroup.com/online/courses/open-source/linux-unhatched
// udemy.com/course/javascript-total/
// Approximate study periods were supplied by the owner, not inferred from badges.
export const courseDetails = [
  {
    title: 'Fundamentos de Python 2',
    description: 'Programación orientada a objetos, módulos y paquetes en Python, manejo de excepciones y archivos para organizar código reutilizable y resolver problemas con programas más completos.',
  },
  {
    title: 'Fundamentos de Linux',
    description: 'Uso de la terminal y comandos de Linux para gestionar archivos, directorios, usuarios y permisos, comprender el sistema operativo y realizar tareas básicas de administración.',
  },
  {
    title: 'Linux Unhatched',
    description: 'Primeros pasos en Linux: navegación desde la terminal, comandos esenciales y manejo de archivos y directorios para desenvolverse con confianza en un entorno de línea de comandos.',
  },
  {
    title: 'Fundamentos de la ciencia de datos con Python',
    description: 'Exploración, limpieza y organización de datos con Python y Pandas; creación de gráficos de barras y dispersión con Matplotlib para reconocer patrones e interpretar y comunicar resultados.',
    url: 'https://www.netacad.com/courses/data-science-essentials-with-python',
    tech: ['Pandas', 'Matplotlib'],
  },
  {
    title: 'JavaScript TOTAL - De Cero a Programador Web en 18 Días',
    description: 'Fundamentos de JavaScript, HTML y CSS para crear páginas interactivas, trabajar con funciones, eventos y el DOM, con una introducción a React y al despliegue con Heroku.',
  },
  {
    title: 'Soporte y Seguridad de Red',
    description: 'Diagnóstico y solución de problemas de red, identificación de amenazas, vulnerabilidades y ciberataques, y medidas de protección para dispositivos y accesos seguros.',
    approximatePeriod: 'Mayo–junio de 2024',
  },
  {
    title: 'Introduction to IoT',
    description: 'Cómo se conectan dispositivos, sensores y redes en el Internet de las Cosas, y cómo la programación, los datos, la automatización y la seguridad apoyan la transformación digital.',
    approximatePeriod: 'Abril–mayo de 2024',
  },
  {
    title: 'Congreso VI',
    description: 'Acercamiento a ideas y aplicaciones de las ciencias de la computación, la electrónica y la industria, para ampliar conocimientos y relacionarlos con el desarrollo de software.',
  },
];

const normalizeTitle = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export function completeCourseDetails(course) {
  const details = courseDetails.find(item => normalizeTitle(item.title) === normalizeTitle(course.title));
  if (!details) return course;
  const next = {...course, description: details.description};
  if (details.approximatePeriod && !course.startDate && !course.endDate && !course.approximatePeriod) next.approximatePeriod = details.approximatePeriod;
  if (!course.role) next.role = course.kind === 'Evento' ? 'Asistente' : 'Estudiante';
  if (!course.status && course.certificate) next.status = 'Finalizado';
  if (!course.url && details.url) next.url = details.url;
  if (details.tech) next.tech = [...new Set([...(course.tech || []), ...details.tech])];
  if (!course.credential && course.platform === 'Udemy') {
    const credential = /\/certificate\/(UC-[a-f0-9-]+)\/?/i.exec(course.url || '');
    if (credential) next.credential = credential[1];
  }
  if (course.location === 'Univerdidad Técnica de Ambato') next.location = 'Universidad Técnica de Ambato';
  return next;
}

export async function migrateCourseDetails(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(39187423)');
    const migration = '2026-11-course-learning-summaries-and-periods';
    const applied = await client.query('SELECT id FROM content_migrations WHERE id=$1', [migration]);
    if (!applied.rows.length) {
      const {rows} = await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
      if (rows.length) {
        const data = rows[0].data;
        const courses = (data.courses || []).map(completeCourseDetails);
        if (JSON.stringify(courses) !== JSON.stringify(data.courses)) {
          data.courses = courses;
          await client.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1', [JSON.stringify(data)]);
        }
      }
      await client.query('INSERT INTO content_migrations(id) VALUES($1)', [migration]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

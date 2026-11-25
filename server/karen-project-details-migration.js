import { migrateProjectDetails, repositoryIdentity } from './project-details-migration.js';

// Verified on main, 2026-11-25: README, architecture, dependency manifests
// and the web/mobile FAQ assistants. AI providers generate promotions;
// KarenBot answers FAQs using local rules.
const repository = 'kiramman-mp3/sistema-inventario-supermercado';
export const verifiedKarenProjectDetails = {
  subtitle: 'Inventario por lotes, ofertas y reservas para Supermercado Karen.',
  type: 'Ecosistema web y móvil',
  tech: ['React', 'React Native', 'Expo', 'TypeScript', 'JavaScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Docker Compose', 'OpenRouter', 'Gemini', 'Server-Sent Events', 'Vercel', 'GitHub Actions'],
  description: 'Ecosistema para Supermercado Karen que conecta un portal web y dos aplicaciones móviles: una para clientes y otra para el personal de bodega. Gestiona el inventario por lotes y fecha de caducidad, priorizando la salida de los productos que vencen primero mediante FEFO. Incluye escaneo de códigos de barras, alertas de caducidad en tiempo real y propuestas de promociones con IA sujetas a aprobación administrativa. Los clientes consultan el catálogo y las ofertas y reservan productos con código de retiro y QR para pagar en caja; el stock se libera cuando vence la reserva. Integra reportes de movimientos y mermas, KarenBot para preguntas frecuentes y servicios separados para tienda y portal con PostgreSQL.',
};

export function completeKarenProjectDetails(project) {
  const links = [project.github, ...(project.repositories || []).map(item => item.url)];
  if (!links.some(link => repositoryIdentity(link) === repository)) return project;
  return { ...project, ...structuredClone(verifiedKarenProjectDetails), example: false, url: project.url || 'https://karen.madebyjohan.xyz' };
}

export function migrateKarenProjectDetails(pool) {
  return migrateProjectDetails(pool, { migration: '2026-11-verified-karen-project-details-v1', transform: completeKarenProjectDetails });
}

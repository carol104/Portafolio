import PDFDocument from 'pdfkit';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const colors = { ink: '#203B4B', body: '#3C505C', muted: '#647C88', accent: '#377F9F', pale: '#DDF2FA', line: '#BDDDEB' };

export function createResume({ profile, technologyGroups = [], courses = [], interests = [] }) {
  const pdf = new PDFDocument({ size: 'A4', margin: 0, info: { Title: `Hoja de vida - ${profile.name}`, Author: profile.name, Subject: 'Perfil, formación y aptitudes' } });
  const width = pdf.page.width;
  const text = (value, x, y, w, size = 10, bold = false, color = colors.body, options = {}) => {
    pdf.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size).fillColor(color);
    pdf.text(value || '', x, y, { width: w, lineGap: 3, ...options });
    return pdf.y;
  };

  pdf.moveTo(0, 0).lineTo(width, 0).lineTo(width, 300).closePath().fill(colors.pale);
  // The public profile uses a short name; the surname is available in its LinkedIn URL.
  const name = profile.name === 'Carol' && profile.linkedin?.includes('1518833ba') ? 'Carol Cañizares Villacís' : profile.name;
  text(name, 40, 36, width - 80, 25, true, colors.ink, { align: 'center', lineGap: 1 });
  text(profile.role, 40, 77, width - 80, 11, false, colors.accent, { align: 'center', characterSpacing: 1.5 });

  const photo = [path.join(root, 'public/assets/yo.jpg'), path.join(root, 'dist/assets/yo.jpg')].find(existsSync);
  pdf.circle(297, 184, 62).fill('#FFFFFF');
  if (photo) {
    pdf.save().circle(297, 184, 58).clip();
    pdf.image(photo, 239, 126, { cover: [116, 116], align: 'center', valign: 'center' });
    pdf.restore();
  } else {
    text(profile.initials || profile.name.slice(0, 1), 239, 164, 116, 30, true, colors.accent, { align: 'center' });
  }

  text('PERFIL', 38, 132, 164, 10, true, colors.accent, { characterSpacing: 1 });
  text([profile.about, profile.objective].filter(Boolean).join(' '), 38, 154, 164, 9.4);
  let contactY = 145;
  for (const [label, value, link] of [
    ['UBICACIÓN', profile.location],
    ['CORREO', profile.email, `mailto:${profile.email}`],
    ['GITHUB', profile.github?.replace('https://', ''), profile.github],
    ['LINKEDIN', profile.linkedin ? 'Carol Cañizares Villacís' : '', profile.linkedin],
  ]) {
    if (!value) continue;
    text(label, 383, contactY, 174, 7.2, true, colors.accent, { characterSpacing: .6 });
    contactY = text(value, 383, contactY + 12, 174, 8.8, false, colors.ink, link ? { link } : {}) + 11;
  }

  const left = { x: 38, y: 305, w: 164 };
  const right = { x: 239, y: 305, w: 318 };
  const section = (column, title) => {
    column.y = text(title, column.x, column.y, column.w, 10.2, true, colors.accent, { characterSpacing: .7 }) + 8;
    pdf.moveTo(column.x, column.y - 3).lineTo(column.x + column.w, column.y - 3).lineWidth(.7).stroke(colors.line);
    column.y += 7;
  };
  const paragraph = (column, value, options = {}) => {
    column.y = text(value, column.x, column.y, column.w, options.size || 9.4, options.bold || false, options.color || colors.body, options) + (options.after ?? 7);
  };
  section(left, 'COMPETENCIAS');
  for (const item of ['Desarrollo de software', 'Desarrollo de API', 'Microservicios y SOA', 'Patrones y c?digo limpio', 'Calidad y pruebas', 'Scrum y control de versiones']) paragraph(left, `? ${item}`, { after: 3 });
  left.y += 17;
  section(left, 'IDIOMAS');
  paragraph(left, 'Inglés', { bold: true, after: 2 });
  paragraph(left, 'Estudios hasta nivel B1', { color: colors.muted, after: 13 });

  left.y += 5;
  section(left, 'TECNOLOGÍAS');
  for (const [label, icon] of [['Lenguajes', 'code'], ['Backend', 'backend'], ['Bases de datos', 'database']]) {
    const group = technologyGroups.find(group => group.visible !== false && group.icon === icon);
    if (!group) continue;
    paragraph(left, label, { bold: true, after: 2 });
    paragraph(left, group.items.join(' ? '), { size: 9, after: 12 });
  }
  if (left.y < 718 && interests.length) {
    left.y += 6;
    section(left, 'INTERESES');
    paragraph(left, interests.filter(item => item.visible !== false).map(item => item.title).join(' · '), { size: 9 });
  }

  {
    section(right, 'FORMACIÓN ACADÉMICA');
    paragraph(right, 'Universidad Técnica de Ambato', { bold: true, size: 11, after: 4 });
    paragraph(right, [profile.education?.title || 'Ingeniería de Software', profile.education?.period].filter(Boolean).join(' | '), { color: colors.muted, after: 18 });
  }
  const training = courses.filter(course => course.visible !== false && !course.placeholder && (course.kind || 'Curso') === 'Curso' && !/congreso/i.test(course.title)).slice(0, 8);
  if (training.length) {
    section(right, 'CURSOS Y FORMACIÓN COMPLEMENTARIA');
    for (const course of training) {
      paragraph(right, course.title, { bold: true, size: 9.6, after: 3 });
      const period = course.endDate ? course.endDate.slice(0, 4) : course.period;
      const duration = course.duration || (/horas/i.test(period || '') ? '' : course.period);
      paragraph(right, [...new Set([course.institution, period, duration].filter(Boolean))].join(' | '), { size: 8.8, color: colors.muted, after: 14 });
    }
  }
  pdf.end();
  return pdf;
}

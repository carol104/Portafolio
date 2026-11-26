import { useState } from 'react';
import { GraduationCap, Award, CalendarDays, ArrowUpRight } from 'lucide-react';
import { COURSE_FILTERS, filterCourses } from './portfolio';
import SectionHeading from './components/SectionHeading';
import ExternalLink from './components/ExternalLink';
import TechnologyTags from './components/TechnologyTags';
import SpotlightCard from './components/SpotlightCard';
import PlatformLogo from './components/PlatformLogo';
import MagneticButton from './components/MagneticButton';
import { fadeUp, Stagger } from './motion';

const icons = { Curso: GraduationCap, Certificación: Award, Evento: CalendarDays };
const dateLabel = value => new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));

export default function Courses({ courses, preview = false }) {
  const [kind, setKind] = useState('Todos');
  const allCourses = courses || [];
  const filtered = filterCourses(allCourses, kind);
  const items = preview ? filtered.slice(0, 2) : filtered;

  return (
    <section id="cursos" className="section courses-section">
      <SectionHeading
        kicker="APRENDER EN MOVIMIENTO"
        text="Cursos, certificaciones, hackathones y eventos tecnológicos que forman parte de mi recorrido."
      >
        Formación, credenciales <span>y comunidad.</span>
      </SectionHeading>

      <div className="project-toolbar course-toolbar">
        <div className="filters" role="group" aria-label="Filtrar formación por tipo">
          {COURSE_FILTERS.map(([value, label]) => (
            <button key={value} type="button" aria-pressed={kind === value} className={kind === value ? 'selected' : ''} onClick={() => setKind(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {items.length ? (
        <Stagger key={kind} className="course-timeline" as="div">
          {items.map((course) => {
            const Icon = icons[course.kind] || GraduationCap;
            return (
              <SpotlightCard
                key={course.id}
                className={`course-card course-${(course.kind || 'Curso').toLowerCase()}`}
                variants={fadeUp}
              >
                <span className="course-node" aria-hidden="true"/>
                
                {/* Espacio limpio para imagen o banner */}
                <div className="course-banner">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="course-banner-img" loading="lazy" />
                  ) : (
                    <div className="course-banner-placeholder" aria-hidden="true">
                      <div className="course-banner-sheen" />
                      <div className="course-banner-brand">
                        <PlatformLogo platform={course.platform} institution={course.institution} className="course-banner-logo" />
                        <Icon size={34} strokeWidth={1.5} className="course-banner-icon" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="course-card-top">
                  <div className="course-platform-badge">
                    <PlatformLogo platform={course.platform} institution={course.institution} className="course-badge-logo" />
                    <span className="course-platform-name">{course.institution}</span>
                  </div>
                  <div className="course-kind-pill">
                    <Icon size={16} aria-hidden="true"/>
                    <span>{course.kind || 'Curso'}{course.period && ` · ${course.period}`}</span>
                  </div>
                </div>

                <h3 className="course-title">{course.title}</h3>

                <dl className="course-details">
                  {!course.startDate && !course.endDate && course.approximatePeriod && <div><dt>Período aproximado</dt><dd>{course.approximatePeriod}</dd></div>}
                  {course.startDate && <div><dt>Inicio</dt><dd><time dateTime={course.startDate}>{dateLabel(course.startDate)}</time></dd></div>}
                  {course.endDate && <div><dt>Fin</dt><dd><time dateTime={course.endDate}>{dateLabel(course.endDate)}</time></dd></div>}
                  {[[course.duration, 'Duración'], [course.modality, 'Modalidad'], [course.location, 'Ubicación'], [course.status, 'Estado'], [course.role, 'Participación']].map(([value, label]) => value ? <div key={label}><dt>{label}</dt><dd>{value}</dd></div> : null)}
                </dl>

                {course.credential && (
                  <p className="course-credential">
                    Credencial: <span>{course.credential}</span>
                  </p>
                )}

                {course.description && <p className="course-description">{course.description}</p>}

                {course.tech?.length > 0 && <TechnologyTags items={course.tech}/>}

                <div className="course-actions">
                  {/^\/api\/media\/[a-f0-9-]{36}$/.test(course.certificate || '') && (
                    <ExternalLink href={course.certificate} className="text-link">
                      Ver certificado <ArrowUpRight size={18} aria-hidden="true"/>
                    </ExternalLink>
                  )}
                  {course.badge && (
                    <ExternalLink href={course.badge} className="text-link">
                      Ver insignia <ArrowUpRight size={18} aria-hidden="true"/>
                    </ExternalLink>
                  )}
                </div>
              </SpotlightCard>
            );
          })}
        </Stagger>
      ) : (
        <p className="example-note">{allCourses.length ? 'No hay elementos de este tipo por ahora. Prueba otro filtro.' : 'Añade cursos, certificaciones y eventos desde el panel de administración.'}</p>
      )}

      {preview && (
        <div className="section-more-action">
          <MagneticButton className="button secondary button-more" href="/cursos">
            Ver más cursos <ArrowUpRight size={17} />
          </MagneticButton>
        </div>
      )}
    </section>
  );
}

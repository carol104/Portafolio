import { GraduationCap, Award, CalendarDays, ArrowUpRight } from 'lucide-react';
import SectionHeading from './components/SectionHeading';
import ExternalLink from './components/ExternalLink';
import TechnologyTags from './components/TechnologyTags';
import SpotlightCard from './components/SpotlightCard';
import PlatformLogo from './components/PlatformLogo';
import MagneticButton from './components/MagneticButton';
import { fadeUp, Stagger } from './motion';

const icons = { Curso: GraduationCap, Certificación: Award, Evento: CalendarDays };

export default function Courses({ courses, preview = false }) {
  const allCourses = courses || [];
  const items = preview ? allCourses.slice(0, 2) : allCourses;

  return (
    <section id="cursos" className="section courses-section">
      <SectionHeading
        number="04"
        kicker="APRENDER EN MOVIMIENTO"
        text="Cursos, certificaciones, hackathones y eventos tecnológicos que forman parte de mi recorrido."
      >
        Formación, credenciales <span>y comunidad.</span>
      </SectionHeading>

      {items.length ? (
        <Stagger className="course-timeline" as="div">
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
                    <span>{course.kind} · {course.period}</span>
                  </div>
                </div>

                <h3 className="course-title">{course.title}</h3>

                {course.credential && (
                  <p className="course-credential">
                    Credencial: <span>{course.credential}</span>
                  </p>
                )}

                {course.description && <p className="course-description">{course.description}</p>}

                {course.tech?.length > 0 && <TechnologyTags items={course.tech}/>}

                <div className="course-actions">
                  {(course.certificate || course.url) && (
                    <ExternalLink href={course.certificate || course.url} className="text-link">
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
        <p className="example-note">Añade cursos, certificaciones y eventos desde el panel de administración.</p>
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

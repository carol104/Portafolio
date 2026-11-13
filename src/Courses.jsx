import { GraduationCap, Award, CalendarDays, ArrowUpRight } from 'lucide-react';
import SectionHeading from './components/SectionHeading';
import ExternalLink from './components/ExternalLink';
import TechnologyTags from './components/TechnologyTags';
import SpotlightCard from './components/SpotlightCard';
import { fadeUp, Stagger } from './motion';

const icons = { Curso: GraduationCap, Certificación: Award, Evento: CalendarDays };

export default function Courses({ courses }) {
  const items = courses || [];
  return (
    <section id="cursos" className="section courses-section">
      <SectionHeading number="04" kicker="APRENDER EN MOVIMIENTO" text="Cursos, certificaciones, hackathones y eventos tecnológicos que forman parte de mi recorrido.">
        Formación, credenciales <span>y comunidad.</span>
      </SectionHeading>
      {items.length ? (
        <Stagger className="course-timeline" as="div">
          {items.map((course, index) => {
            const Icon = icons[course.kind] || GraduationCap;
            return (
              <SpotlightCard key={course.id} className={`course-card course-${(course.kind || 'Curso').toLowerCase()}`} variants={fadeUp}>
                <span className="course-node" aria-hidden="true"/>
                <div className="course-card-top">
                  <Icon size={26} aria-hidden="true"/>
                  <small>{course.kind} · {course.period}</small>
                </div>
                <h3>{course.title}</h3>
                <h4>{course.institution}</h4>
                {course.credential && <p className="course-credential">Credencial: {course.credential}</p>}
                <p>{course.description}</p>
                <TechnologyTags items={course.tech}/>
                {course.url && <ExternalLink href={course.url} className="text-link">Ver credencial <ArrowUpRight size={18} aria-hidden="true"/></ExternalLink>}
                {course.placeholder && <p className="example-note">Placeholder para completar desde el panel.</p>}
                <span className="course-index">{String(index + 1).padStart(2, '0')}</span>
              </SpotlightCard>
            );
          })}
        </Stagger>
      ) : (
        <p className="example-note">Añade cursos, certificaciones y eventos desde el panel de administración.</p>
      )}
    </section>
  );
}

import { Code2, PanelsTopLeft, Server, Database, Container, ShieldCheck } from 'lucide-react';
import { useContent } from './ContentContext';
import './technologies.css';
import TechnologyLogo from './TechnologyLogo';
import SectionHeading from './components/SectionHeading';
import SpotlightCard from './components/SpotlightCard';
import { fadeUp, Stagger } from './motion';
import { catalogGroups, canonicalTechnology, normalizeTechnology } from './technology-catalog';
import MagneticButton from './components/MagneticButton';

const icons = { code: Code2, frontend: PanelsTopLeft, backend: Server, database: Database, deploy: Container, quality: ShieldCheck };

export default function Technologies({ preview = false }) {
  const { technologyGroups } = useContent();
  const pageGroups = technologyGroups.map(group => ({ ...group, items: group.items.filter(item => normalizeTechnology(item) !== 'aspnetcore') }));
  const groups = preview ? [0, 3, 2].flatMap(index => {
    const seed = catalogGroups[index];
    const group = pageGroups.find(group => group.id === seed.id) || pageGroups.find(group => group.icon === seed.icon);
    if (!group) return [];
    const allowed = new Set(seed.items.map(normalizeTechnology));
    return [{ ...group, title: seed.title, description: seed.description, items: group.items.filter(item => allowed.has(normalizeTechnology(canonicalTechnology(item)))) }];
  }) : pageGroups;
  return (
    <section id="tecnologias" className="section technology-section" aria-labelledby="technology-title">
      <SectionHeading id="technology-title" kicker="MI CAJA DE HERRAMIENTAS" text={preview ? 'tecnologías que utilizo para desarrollar mis soluciones' : 'Tecnologías, herramientas y aptitudes organizadas por área.'}>
        {preview ? <>Tecnologías con las<br />que <span>trabajo.</span></> : <>Mis áreas de <span>conocimiento.</span></>}
      </SectionHeading>
      <Stagger className="technology-grid">
        {groups.map((group) => {
          const Icon = icons[group.icon] || Code2;
          return (
            <SpotlightCard key={group.id} className={`technology-card technology-${group.icon}`} variants={fadeUp}>
              <div className="technology-card-top"><span className="technology-icon"><Icon size={23} /></span></div>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <ul>{group.items.map(item => <li key={item}><TechnologyLogo name={item} /><span className="technology-name">{item}</span></li>)}</ul>
            </SpotlightCard>
          );
        })}
      </Stagger>
      {preview && <div className="section-more-action"><MagneticButton className="button secondary button-more" href="/aptitudes">Ver todas las aptitudes y tecnologías</MagneticButton></div>}
    </section>
  );
}

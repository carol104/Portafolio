import { Code2, PanelsTopLeft, Server, Database, Container, ShieldCheck } from 'lucide-react';
import { useContent } from './ContentContext';
import './technologies.css';
import TechnologyLogo from './TechnologyLogo';
import SectionHeading from './components/SectionHeading';
import SpotlightCard from './components/SpotlightCard';
import { fadeUp, Stagger } from './motion';

const icons = { code: Code2, frontend: PanelsTopLeft, backend: Server, database: Database, deploy: Container, quality: ShieldCheck };

export default function Technologies() {
  const { technologyGroups } = useContent();
  return (
    <section id="tecnologias" className="section technology-section" aria-labelledby="technology-title">
      <SectionHeading id="technology-title" kicker="MI CAJA DE HERRAMIENTAS" text="Lenguajes, frameworks y herramientas que he utilizado para dar forma a mis proyectos.">
        Tecnologías con las<br />que <span>trabajo.</span>
      </SectionHeading>
      <Stagger className="technology-grid">
        {technologyGroups.map((group) => {
          const Icon = icons[group.icon];
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
    </section>
  );
}

import { ArrowUpRight, Globe2, Smartphone, Network, Server } from 'lucide-react';
import SectionHeading from './SectionHeading';
import SpotlightCard from './SpotlightCard';
import MagneticButton from './MagneticButton';
import { Stagger, fadeUp } from '../motion';
import './services.css';

const serviceIcons = [Globe2, Smartphone, Network, Server];

export default function ServicesSection({ services }) {
  return <section id="servicios" className="section services-section" aria-labelledby="services-title">
    <div className="services-heading">
      <SectionHeading id="services-title" kicker="SERVICIOS" text="Desarrollo aplicaciones, conecto servicios y trabajo con la lógica y los datos que necesitan para funcionar.">
        Desarrollo web <span>y backend.</span>
      </SectionHeading>
      <MagneticButton href="/contacto" className="text-link">Cuéntame qué necesitas <ArrowUpRight size={17} /></MagneticButton>
    </div>
    <Stagger className="services-grid">
      {services.map((service, index) => {
        const Icon = serviceIcons[index % serviceIcons.length];
        return <SpotlightCard key={service.id} className="service-card" variants={fadeUp}>
          <span className="service-icon" aria-hidden="true"><Icon size={21} /></span>
          <div><h3>{service.title}</h3><p>{service.text}</p></div>
        </SpotlightCard>;
      })}
    </Stagger>
  </section>;
}

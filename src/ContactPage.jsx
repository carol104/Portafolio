import React from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useContent } from './ContentContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ContactForm from './components/ContactForm';
import SocialLinks from './components/SocialLinks';
import { Reveal } from './motion';

export default function ContactPage() {
  const { profile } = useContent();

  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Header />
      <main id="contenido" className="subpage-main contact-page">
        <div className="subpage-hero">
          <a href="/" className="back-link"><ArrowLeft size={16} /> Volver al inicio</a>
        </div>
        <section id="contacto" className="section contact" aria-labelledby="contact-title">
          <Reveal className="contact-copy">
            <p className="eyebrow"><span>↗ /</span> EL SIGUIENTE PASO</p>
            <h1 id="contact-title">Las grandes ideas<br />empiezan con un<br /><span>hola.</span><span className="contact-star" aria-hidden="true">✳</span></h1>
            <p>¿Tienes un proyecto en mente o una oportunidad para colaborar? Me encantará conocerla.</p>
            {profile.email && <a className="contact-email" href={'mailto:' + profile.email}>{profile.email}<ArrowUpRight size={22} /></a>}
            <SocialLinks profile={profile} />
          </Reveal>
          <ContactForm />
        </section>
      </main>
      <Footer />
    </>
  );
}

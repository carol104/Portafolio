import React from 'react';
import { ArrowLeft, Award } from 'lucide-react';
import { useContent } from './ContentContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Courses from './Courses';

export default function CoursesPage() {
  const { courses } = useContent();

  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Header activeSection="cursos" />
      <main id="contenido" className="subpage-main">
        <div className="subpage-hero">
          <div className="subpage-hero-inner">
            <a href="/" className="back-link">
              <ArrowLeft size={16} /> Volver al inicio
            </a>
            <div className="subpage-badge">
              <Award size={15} /> Credenciales y formación
            </div>
            <h1 className="subpage-title">
              Cursos, certificaciones <span>y eventos.</span>
            </h1>
            <p className="subpage-description">
              Mi recorrido de aprendizaje: cursos, certificaciones y eventos, con fechas, detalles de participación, diplomas e insignias.
            </p>
          </div>
        </div>
        <Courses courses={courses} preview={false} />
      </main>
      <Footer />
    </>
  );
}


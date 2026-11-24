import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from '../router';
import './luminous-experience.css';

const curve = 'M 39 24 C 72 100 10 135 29 210 S 68 310 37 390 S 19 485 40 555 S 69 670 35 776';
const stars = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 37.73 + 3) % 100}%`,
  top: `${(i * 23.17 + 7) % 100}%`,
  '--delay': `${-(i % 9)}s`,
  '--size': i % 5 === 0 ? '3px' : '2px',
}));

export default function LuminousExperience() {
  const { path } = useRouter();
  const id = useId().replace(/:/g, '');
  const lineRef = useRef(null);
  const progressRef = useRef(null);
  const headRef = useRef(null);
  const mobileRef = useRef(null);
  const [stops, setStops] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const main = document.getElementById('contenido');
    if (!main) return;
    const sections = [...main.children].filter(element =>
      element.matches('section, .subpage-hero')
    );
    if (!sections.length) sections.push(main);
    const line = lineRef.current;
    const length = line.getTotalLength();
    setStops(sections.map((element, index) => ({
      element,
      label: element.querySelector('h1, h2')?.textContent || `Sección ${index + 1}`,
      point: line.getPointAtLength(length * index / Math.max(1, sections.length - 1)),
    })));
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const positions = sections.map(element => Math.min(max, Math.max(0, element.getBoundingClientRect().top + top - 120)));
      let index = 0;
      positions.forEach((position, i) => { if (top + 2 >= position) index = i; });
      const next = positions[index + 1] ?? max;
      const between = Math.min(1, Math.max(0, (top - positions[index]) / Math.max(1, next - positions[index])));
      const progress = sections.length > 1 ? Math.min(1, (index + between) / (sections.length - 1)) : top / max;
      progressRef.current.style.strokeDasharray = `${progress} 1`;
      const point = line.getPointAtLength(length * progress);
      headRef.current.setAttribute('cx', point.x);
      headRef.current.setAttribute('cy', point.y);
      mobileRef.current.style.transform = `scaleX(${top / max})`;
      setActive(index);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(main);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [path]);

  return <>
    <div className="cosmic-atmosphere" aria-hidden="true">
      <div className="cosmic-atmosphere__aurora" />
      {stars.map((style, i) => <i key={i} className="cosmic-star" style={style} />)}
    </div>
    <nav className="luminous-rail" aria-label="Progreso y navegación de secciones">
      <svg viewBox="0 0 76 800" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-gradient`} x1="30" y1="0" x2="45" y2="800" gradientUnits="userSpaceOnUse">
            <stop stopColor="#82aaff" /><stop offset="1" stopColor="#63e8da" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-200%" y="-20%" width="500%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <path ref={lineRef} d={curve} stroke="#a5c2e6" strokeOpacity=".18" strokeWidth="2" />
        <path className="luminous-rail__halo" d={curve} stroke={`url(#${id}-gradient)`} strokeWidth="5" filter={`url(#${id}-glow)`} />
        <path ref={progressRef} d={curve} pathLength="1" stroke={`url(#${id}-gradient)`} strokeWidth="2.5" strokeLinecap="round" />
        <circle ref={headRef} r="5" fill="#91b5ff" className="luminous-rail__head" />
      </svg>
      {stops.map((stop, index) => <button
        key={index}
        className={`luminous-rail__stop${index <= active ? ' is-reached' : ''}`}
        style={{ left: `${stop.point.x / 76 * 100}%`, top: `${stop.point.y / 800 * 100}%` }}
        type="button"
        aria-label={`Ir a ${stop.label}`}
        aria-current={index === active ? 'step' : undefined}
        title={stop.label}
        onClick={() => stop.element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })}
      ><span>{String(index + 1).padStart(2, '0')}</span><i /></button>)}
    </nav>
    <div className="luminous-mobile-progress" aria-hidden="true"><span ref={mobileRef} /></div>
  </>;
}

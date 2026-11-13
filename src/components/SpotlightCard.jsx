import { m } from '../motion';

export default function SpotlightCard({ as = 'article', className = '', children, ...props }) {
  const Comp = m[as] || m.article;

  function move(event) {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - box.top}px`);
  }

  return (
    <Comp className={`spotlight-card ${className}`.trim()} onMouseMove={move} {...props}>
      {children}
    </Comp>
  );
}

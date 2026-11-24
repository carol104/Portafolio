import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './custom-cursor.css';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cursor = cursorRef.current;
    let frame = 0;
    let previousTime = 0;
    let visible = false;
    const target = { x: 0, y: 0 };
    const ring = { x: 0, y: 0 };

    const place = (element, point) => {
      element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    };

    const animate = time => {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      const amount = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 55);
      ring.x += (target.x - ring.x) * amount;
      ring.y += (target.y - ring.y) * amount;
      place(ringRef.current, ring);
      if (Math.abs(target.x - ring.x) + Math.abs(target.y - ring.y) > 0.1) {
        frame = requestAnimationFrame(animate);
      } else {
        frame = 0;
        previousTime = 0;
      }
    };

    const hide = () => {
      visible = false;
      cursor.classList.remove('is-visible', 'is-pressed', 'is-interactive');
      document.documentElement.classList.remove('has-custom-cursor');
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    };

    const move = event => {
      if (!media.matches || event.pointerType !== 'mouse') {
        hide();
        return;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      place(dotRef.current, target);
      if (!visible) {
        ring.x = target.x;
        ring.y = target.y;
        place(ringRef.current, ring);
        visible = true;
        cursor.classList.add('is-visible');
        document.documentElement.classList.add('has-custom-cursor');
      }
      cursor.classList.toggle('is-interactive', Boolean(
        event.target instanceof Element && event.target.closest('a, button:not(:disabled), [role="button"], input, textarea, select, summary, label[for]')
      ));
      if (!frame) frame = requestAnimationFrame(animate);
    };
    const press = event => {
      if (visible && event.pointerType === 'mouse') cursor.classList.add('is-pressed');
    };
    const release = () => cursor.classList.remove('is-pressed');
    const leave = event => { if (!event.relatedTarget) hide(); };
    const onVisibility = () => { if (document.hidden) hide(); };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointercancel', hide);
    window.addEventListener('blur', hide);
    document.addEventListener('pointerout', leave);
    document.addEventListener('visibilitychange', onVisibility);
    media.addEventListener('change', hide);

    return () => {
      hide();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', hide);
      window.removeEventListener('blur', hide);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('visibilitychange', onVisibility);
      media.removeEventListener('change', hide);
    };
  }, []);

  return createPortal(
    <div className="custom-cursor" ref={cursorRef} aria-hidden="true">
      <div className="custom-cursor__ring" ref={ringRef}><span /></div>
      <div className="custom-cursor__dot" ref={dotRef}><span /></div>
    </div>,
    document.body
  );
}

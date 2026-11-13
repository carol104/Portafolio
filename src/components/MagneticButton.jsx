import { useRef } from 'react';
import { m, useMotionValue, useSpring } from 'framer-motion';

const spring = { stiffness: 260, damping: 18, mass: 0.35 };

export default function MagneticButton({ as = 'a', children, className, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);
  const Comp = m[as] || m.a;

  function move(event) {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    x.set((event.clientX - box.left - box.width / 2) * 0.28);
    y.set((event.clientY - box.top - box.height / 2) * 0.28);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <Comp
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={move}
      onMouseLeave={reset}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </Comp>
  );
}

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

export const viewportOnce = { once: true, amount: 0.14, margin: '0px 0px -48px 0px' };

export function MotionRoot({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>{children}</LazyMotion>
    </MotionConfig>
  );
}

export function Reveal({ children, className, delay = 0, as = 'div', ...props }) {
  const Comp = m[as] || m.div;
  return (
    <Comp
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function Stagger({ children, className, as = 'div', ...props }) {
  const Comp = m[as] || m.div;
  return (
    <Comp className={className} variants={stagger} initial="hidden" whileInView="show" viewport={viewportOnce} {...props}>
      {children}
    </Comp>
  );
}

export { m };

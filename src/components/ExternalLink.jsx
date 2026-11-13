export default function ExternalLink({ href, children, className, ...props }) {
  return (
    <a {...props} href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

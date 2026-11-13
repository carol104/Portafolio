import { Code2 } from 'lucide-react';

export default function Brand({ name = 'dev.folio', href = '#inicio' }) {
  return (
    <a className="brand" href={href} aria-label={`${name} · Ir al inicio`}>
      <span><Code2 size={20} aria-hidden="true"/></span>
      <span className="brand-name">{name}</span>
    </a>
  );
}

import TechnologyLogo from '../TechnologyLogo';

export default function TechnologyTags({ items }) {
  if (!items.length) return null;
  return (
    <ul className="tags" aria-label="Tecnologías utilizadas">
      {items.map(item => <li key={item}><TechnologyLogo name={item}/><span>{item}</span></li>)}
    </ul>
  );
}

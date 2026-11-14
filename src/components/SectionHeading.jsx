import { Reveal } from '../motion';

export default function SectionHeading({ kicker, children, text, id }) {
  return (
    <Reveal className="section-heading">
      <div>
        {kicker && <p className="eyebrow">{kicker}</p>}
        <h2 id={id}>{children}</h2>
      </div>
      {text && <p>{text}</p>}
    </Reveal>
  );
}

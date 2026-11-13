import { Reveal } from '../motion';

export default function SectionHeading({ number, kicker, children, text, id }) {
  return (
    <Reveal className="section-heading">
      <div>
        <p className="eyebrow"><span>{number} /</span> {kicker}</p>
        <h2 id={id}>{children}</h2>
      </div>
      {text && <p>{text}</p>}
    </Reveal>
  );
}

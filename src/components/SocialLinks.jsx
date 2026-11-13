import { ArrowUpRight, Github, Linkedin } from 'lucide-react';
import ExternalLink from './ExternalLink';

export default function SocialLinks({ profile, compact = false }) {
  const links = [
    { label: 'GitHub', href: profile.github, Icon: Github },
    { label: 'LinkedIn', href: profile.linkedin, Icon: Linkedin },
  ].filter(link => link.href);

  if (!links.length) return null;
  return (
    <div className={`social-links${compact ? ' social-links-compact' : ''}`} aria-label="Redes profesionales">
      {links.map(({ label, href, Icon }) => (
        <ExternalLink key={label} href={href}>
          <Icon size={19} aria-hidden="true"/>
          {label}
          <ArrowUpRight size={16} aria-hidden="true"/>
        </ExternalLink>
      ))}
    </div>
  );
}

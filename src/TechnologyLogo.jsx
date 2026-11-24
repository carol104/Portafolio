import { useState, useEffect } from 'react';
import { technologyLogoName, technologyFallback } from './technology-logos.js';
export { technologyLogoName } from './technology-logos.js';
export default function TechnologyLogo({ name }) {
    const logo = technologyLogoName(name), [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [logo]);
    const fallback = technologyFallback(name);
    return <span className={'technology-logo ' + (logo && !failed ? 'logo-' + logo : 'logo-custom')} style={!logo || failed ? { background: fallback.color, borderColor: fallback.color } : undefined} aria-hidden="true">{logo && !failed ? <img src={'/technology-logos/' + logo + '.svg'} alt="" width="30" height="30" loading="lazy" onError={() => setFailed(true)} /> : <span className="technology-monogram">{fallback.initial}</span>}</span>
}

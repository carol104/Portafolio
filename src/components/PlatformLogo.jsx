export function platformLogoName(platform, institution) {
  const text = `${platform || ''} ${institution || ''}`.toLowerCase().replace(/[\s.\-_]/g, '');
  if (text.includes('cisco')) return 'cisco';
  if (text.includes('udemy')) return 'udemy';
  return null;
}

export default function PlatformLogo({ platform, institution, className = '' }) {
  const logo = platformLogoName(platform, institution);
  if (!logo) return null;
  return (
    <span className={`platform-logo-wrap platform-${logo} ${className}`} aria-hidden="true">
      <img
        src={`/technology-logos/${logo}.svg`}
        alt=""
        className="platform-logo-img"
        loading="lazy"
      />
    </span>
  );
}


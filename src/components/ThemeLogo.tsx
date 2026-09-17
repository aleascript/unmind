import useBaseUrl from '@docusaurus/useBaseUrl';
import {site} from '@site/site.config';

type ThemeLogoProps = {
  alt?: string;
  className?: string;
};

export default function ThemeLogo({
  alt = `${site.title} logo`,
  className = 'theme-logo',
}: ThemeLogoProps) {
  const lightPath = site.identity.logo ?? site.identity.logo;
  const darkPath =
    site.identity.logoDark ??
    site.identity.logo;

  const lightSrc = useBaseUrl(lightPath ?? '');
  const darkSrc = useBaseUrl(darkPath ?? lightPath ?? '');

  if (!lightPath) {
    return null;
  }

  return (
    <span className={className}>
      <img
        className={`${className}__image ${className}__image--light`}
        src={lightSrc}
        alt={alt}
      />
      <img
        className={`${className}__image ${className}__image--dark`}
        src={darkSrc}
        alt={alt}
      />
    </span>
  );
}

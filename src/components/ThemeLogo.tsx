import useBaseUrl from '@docusaurus/useBaseUrl';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useColorMode} from '@docusaurus/theme-common';
import {site} from '@site/site.config';

type ThemeLogoProps = {
  alt?: string;
  className?: string;
};

export default function ThemeLogo({
  alt = `${site.title} logo`,
  className = 'theme-logo',
}: ThemeLogoProps) {
  const lightPath = site.identity.logo;
  const darkPath = site.identity.logoDark ?? lightPath;
  const isBrowser = useIsBrowser();
  const {colorMode} = useColorMode();
  const selectedPath = isBrowser && colorMode === 'dark' ? darkPath : lightPath;
  const src = useBaseUrl(selectedPath ?? '');

  if (!lightPath) {
    return null;
  }

  return (
    <span className={className}>
      <img className={`${className}__image`} src={src} alt={alt} />
    </span>
  );
}

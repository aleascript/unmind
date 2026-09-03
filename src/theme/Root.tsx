import type {ReactNode} from 'react';
import {useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {SiteTheme, ThemePalette} from '../../site.config';

const PERSIST_QUERY_PARAMETER = 'persistLocale';

function readPreference(storageKey: string, supportedLocales: readonly string[]): string | null {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value && supportedLocales.includes(value) ? value : null;
  } catch {
    return null;
  }
}

function savePreference(storageKey: string, locale: string, supportedLocales: readonly string[]): void {
  if (!supportedLocales.includes(locale)) return;
  try {
    window.localStorage.setItem(storageKey, locale);
  } catch {
    // The site remains usable when browser storage is unavailable.
  }
}

function detectBrowserLocale(supportedLocales: readonly string[], defaultLocale: string): string {
  const browserLocales = navigator.languages ?? [navigator.language];
  for (const browserLocale of browserLocales) {
    const normalizedLocale = browserLocale.toLowerCase();
    const exactMatch = supportedLocales.find((locale) => locale.toLowerCase() === normalizedLocale);
    if (exactMatch) return exactMatch;
    const language = normalizedLocale.split('-')[0];
    const languageMatch = supportedLocales.find(
      (locale) => locale.toLowerCase().split('-')[0] === language,
    );
    if (languageMatch) return languageMatch;
  }
  return defaultLocale;
}

function paletteVariables(palette: ThemePalette): string {
  return [
    `--site-primary:${palette.primary}`,
    `--site-background:${palette.background}`,
    `--site-surface:${palette.surface}`,
    `--site-text:${palette.text}`,
    `--site-muted:${palette.muted}`,
    `--site-border:${palette.border}`,
  ].join(';');
}

function themeStyles(theme: SiteTheme | undefined): string {
  if (!theme) return '';
  return `
:root {
  ${paletteVariables(theme.colors.light)};
  --site-font-body:${theme.typography.body};
  --site-font-heading:${theme.typography.heading};
  --site-font-mono:${theme.typography.mono};
  --site-heading-weight:${theme.typography.headingWeight};
  --site-radius:${theme.shape.radius};
  --site-border-width:${theme.shape.borderWidth};
  --site-navbar-shadow:${theme.shape.navbarShadow};
  --site-content-width:${theme.layout.contentWidth};
}
[data-theme='dark'] { ${paletteVariables(theme.colors.dark)}; }
`;
}

export default function Root({children}: {children: ReactNode}): ReactNode {
  const {i18n, siteConfig} = useDocusaurusContext();
  const visualTheme = siteConfig.customFields?.visualTheme as SiteTheme | undefined;

  useEffect(() => {
    const url = new URL(window.location.href);
    const siteBaseUrl = i18n.localeConfigs[i18n.defaultLocale].baseUrl;
    const supportedLocales = i18n.locales;
    const storageKey = `resonance-site:${siteBaseUrl}:locale`;

    if (url.searchParams.get(PERSIST_QUERY_PARAMETER) === 'true') {
      savePreference(storageKey, i18n.currentLocale, supportedLocales);
      url.searchParams.delete(PERSIST_QUERY_PARAMETER);
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
      return;
    }

    if (i18n.currentLocale !== i18n.defaultLocale || url.pathname !== siteBaseUrl) return;

    const preferredLocale =
      readPreference(storageKey, supportedLocales) ??
      detectBrowserLocale(supportedLocales, i18n.defaultLocale);
    savePreference(storageKey, preferredLocale, supportedLocales);

    if (preferredLocale !== i18n.defaultLocale) {
      window.location.replace(`${siteBaseUrl}${preferredLocale}/`);
    }
  }, [i18n]);

  return (
    <>
      <style>{themeStyles(visualTheme)}</style>
      {children}
    </>
  );
}

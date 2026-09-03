export type ThemePalette = {
  primary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

export type SiteTheme = {
  colors: {
    light: ThemePalette;
    dark: ThemePalette;
  };
  typography: {
    body: string;
    heading: string;
    mono: string;
    headingWeight: number;
  };
  shape: {
    radius: string;
    borderWidth: string;
    navbarShadow: string;
  };
  layout: {
    contentWidth: string;
  };
};

export const site = {
  title: 'Unmind',
  tagline: 'You are not here by mistake.',
  description: 'A short, closed and demanding Resonance role-playing game about loss, revelation and a mind coming apart.',
  author: 'AleaScript',
  defaultLocale: 'en',
  locales: {
    en: {
      htmlLang: 'en',
      label: 'English',
    },
    fr: {
      htmlLang: 'fr',
      label: 'Français',
    },
  },
  repository: {
    defaultFullName: 'aleascript/unmind',
  },
  identity: {
    logo: null,
    favicon: null,
  },
  theme: {
    colors: {
      light: {
        primary: '#4f6a61',
        background: '#f3f1eb',
        surface: '#e7e9e4',
        text: '#252a28',
        muted: '#69736f',
        border: '#b8c0bb',
      },
      dark: {
        primary: '#a7b9b2',
        background: '#141816',
        surface: '#1c211e',
        text: '#e8ece9',
        muted: '#a0aaa5',
        border: '#3b4741',
      },
    },
    typography: {
      body: 'Arial, "Helvetica Neue", ui-sans-serif, system-ui, sans-serif',
      heading: 'Georgia, "Times New Roman", ui-serif, serif',
      mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
      headingWeight: 500,
    },
    shape: {
      radius: '0.12rem',
      borderWidth: '1px',
      navbarShadow: '0 1px 0 rgb(56 74 65 / 24%)',
    },
    layout: {
      contentWidth: '50rem',
    },
  } satisfies SiteTheme,
} as const;

export function definePublications(config) {
  return config;
}

export default definePublications({
  release: {
    initialVersion: '0.1.0',
  },
  markdown: {
    admonitions: ['design'],
  },
  publications: {
    unmind: {
      author: 'AleaScript',
      revision: 'Draft',
      license: {
        label: 'CC BY 4.0',
        href: 'https://creativecommons.org/licenses/by/4.0/',
        attribution: {
          title: 'Unmind',
          author: 'AleaScript',
          href: null,
        },
      },
      lineage: {
        designedWith: {
          label: 'Resonance',
          href: 'https://aleascript.github.io/resonance/',
        },
        poweredBy: null,
      },
      size: 'A5',
      theme: 'publication/theme.css',
      cover: {
        image: 'static/img/site/unmind_indigo_200.png',
        showTitle: false,
        showMetadata: true,
      },
      outputName: 'unmind',
      locales: {
        en: {
          title: 'Unmind',
          tocTitle: 'Contents',
          contents: [
            'docs/en/index.md',
            'docs/en/rules.md',
            'docs/en/booklets.md',
            'docs/en/watch.md',
            'docs/en/serve.md',
            'docs/en/please.md',
            'docs/en/fade.md',
            'docs/en/order.md',
            'docs/en/resist.md',
          ],
          outputs: ['pdf'],
        },
        fr: {
          title: 'Unmind',
          tocTitle: 'Sommaire',
          contents: [
            'docs/fr/index.md',
            'docs/fr/rules.md',
            'docs/fr/booklets.md',
            'docs/fr/watch.md',
            'docs/fr/serve.md',
            'docs/fr/please.md',
            'docs/fr/fade.md',
            'docs/fr/order.md',
            'docs/fr/resist.md',
          ],
          outputs: ['pdf'],
        },
      },
    },
  },
});

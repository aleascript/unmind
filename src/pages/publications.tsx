import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type PublicationFormat = {
  format: string;
  path: string;
};

type PublicationLocale = {
  title: string;
  formats: PublicationFormat[];
};

type Publication = {
  id: string;
  outputName: string;
  revision: string | null;
  locales: Record<string, PublicationLocale>;
};

type PublicationManifest = {
  version: string;
  publications: Publication[];
};

const copy = {
  en: {
    title: 'Publications',
    description: 'Download the current published editions of Unmind.',
    version: 'Corpus version',
    revision: 'Revision',
    unavailable: 'No publication is available for this language yet.',
    loading: 'Loading publications…',
    error: 'The publication manifest could not be loaded.',
  },
  fr: {
    title: 'Publications',
    description: 'Téléchargez les éditions actuellement publiées de Unmind.',
    version: 'Version du corpus',
    revision: 'Révision',
    unavailable: "Aucune publication n'est encore disponible dans cette langue.",
    loading: 'Chargement des publications…',
    error: "Le manifeste des publications n'a pas pu être chargé.",
  },
} as const;

export default function PublicationsPage(): React.ReactNode {
  const {i18n, siteConfig} = useDocusaurusContext();
  const locale = i18n.currentLocale;
  const labels = copy[locale as keyof typeof copy] ?? copy.en;
  const configuredDeploymentBaseUrl = siteConfig.customFields?.deploymentBaseUrl;
  const deploymentBaseUrl =
    typeof configuredDeploymentBaseUrl === 'string'
      ? configuredDeploymentBaseUrl
      : siteConfig.baseUrl;
  const downloadsBase = `${deploymentBaseUrl.replace(/\/?$/, '/')}downloads/`;
  const manifestUrl = `${downloadsBase}publications.json`;
  const [manifest, setManifest] = useState<PublicationManifest | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(manifestUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Publication manifest returned ${response.status}`);
        }
        return response.json() as Promise<PublicationManifest>;
      })
      .then((value) => {
        if (!cancelled) {
          setManifest(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  const localized =
    manifest?.publications
      .map((publication) => ({
        publication,
        locale: publication.locales[locale],
      }))
      .filter((entry) => entry.locale) ?? [];

  return (
    <Layout title={labels.title} description={labels.description}>
      <main className="container margin-vert--lg publications-page">
        <header className="publications-header">
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
          {manifest ? (
            <p className="publications-version">
              {labels.version}: <strong>{manifest.version}</strong>
            </p>
          ) : null}
        </header>

        {failed ? <div className="alert alert--danger">{labels.error}</div> : null}
        {!manifest && !failed ? <p>{labels.loading}</p> : null}
        {manifest && localized.length === 0 ? <p>{labels.unavailable}</p> : null}

        <div className="publications-grid">
          {localized.map(({publication, locale: localizedPublication}) => (
            <article className="publication-card" key={publication.id}>
              <h2>{localizedPublication.title}</h2>
              {publication.revision ? (
                <p className="publication-revision">
                  {labels.revision}: {publication.revision}
                </p>
              ) : null}
              <div className="publication-formats">
                {localizedPublication.formats.map((asset) => (
                  <a
                    className="button button--primary button--sm"
                    href={`${downloadsBase}${asset.path}`}
                    key={asset.format}>
                    {asset.format.toUpperCase()}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </Layout>
  );
}

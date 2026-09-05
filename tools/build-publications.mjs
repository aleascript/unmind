import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from '@vivliostyle/cli';
import config from '../publications.config.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workRoot = path.join(projectRoot, '.publication-workspace');
const outputRoot = path.join(projectRoot, 'dist', 'publications');

const standardAdmonitions = ['note', 'tip', 'info', 'warning', 'danger', 'caution'];
const defaultTitles = {
  en: {
    note: 'Note',
    tip: 'Tip',
    info: 'Info',
    warning: 'Warning',
    danger: 'Danger',
    caution: 'Caution',
    design: 'Design note',
  },
  fr: {
    note: 'Note',
    tip: 'Conseil',
    info: 'Information',
    warning: 'Attention',
    danger: 'Danger',
    caution: 'Prudence',
    design: 'Note de design',
  },
};

const publicationLabels = {
  en: {
    version: 'Version',
    revision: 'Revision',
    designedWith: 'designed with',
    poweredBy: 'powered by',
  },
  fr: {
    version: 'Version',
    revision: 'Révision',
    designedWith: 'conçu avec',
    poweredBy: 'propulsé par',
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function linkHtml(link) {
  if (!link) {
    return null;
  }

  const label = escapeHtml(link.label);
  return link.href
    ? `<a href="${escapeHtml(link.href)}">${label}</a>`
    : label;
}

function resolvePublicationVersion() {
  const explicit = process.env.PUBLICATION_VERSION?.trim();
  if (explicit) {
    return explicit;
  }

  try {
    const tag = execFileSync(
      'git',
      ['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*'],
      {cwd: projectRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']},
    ).trim();

    if (/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
      return tag.slice(1);
    }
  } catch {
    // A repository created from the template has no release tag yet.
  }

  return config.release?.initialVersion ?? '0.1.0';
}

function parseOpening(line) {
  const match = line.match(/^:::([A-Za-z][\w-]*)(?:\[(.*)\])?\s*$/);
  return match ? {type: match[1], title: match[2] ?? null} : null;
}

function transformAdmonitions(markdown, locale, customTypes) {
  const allowed = new Set([...standardAdmonitions, ...customTypes]);
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let inFence = false;
  let fenceMarker = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.match(/^\s*(```+|~~~+)/);

    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fence[1][0];
      } else if (fence[1][0] === fenceMarker) {
        inFence = false;
        fenceMarker = null;
      }
      output.push(line);
      continue;
    }

    if (inFence) {
      output.push(line);
      continue;
    }

    const opening = parseOpening(line);
    if (!opening) {
      output.push(line);
      continue;
    }

    if (!allowed.has(opening.type)) {
      throw new Error(
        `Unsupported Markdown directive :::${opening.type}. ` +
          `Declare it in publications.config.mjs before publishing it.`,
      );
    }

    const body = [];
    let foundClosing = false;
    for (index += 1; index < lines.length; index += 1) {
      if (lines[index].trim() === ':::') {
        foundClosing = true;
        break;
      }
      if (parseOpening(lines[index])) {
        throw new Error('Nested admonitions are not supported by the publication POC yet.');
      }
      body.push(lines[index]);
    }

    if (!foundClosing) {
      throw new Error(`Unclosed :::${opening.type} admonition.`);
    }

    const fallbackTitle =
      defaultTitles[locale]?.[opening.type] ?? opening.type.replaceAll('-', ' ');
    const title = opening.title || fallbackTitle;
    const marker =
      `<span class="publication-admonition-title publication-admonition-${opening.type}">` +
      `${escapeHtml(title)}</span>`;

    output.push(`> ${marker}`);
    output.push('>');
    for (const bodyLine of body) {
      output.push(bodyLine.length === 0 ? '>' : `> ${bodyLine}`);
    }
  }

  return `${output.join('\n')}\n`;
}

function decodeFrontmatterScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  return trimmed;
}

function ensureDocumentTitleHeading(markdown) {
  if (/^#\s+\S/m.test(markdown)) {
    return markdown;
  }

  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) {
    return markdown;
  }

  const titleLine = frontmatter[1]
    .split(/\r?\n/)
    .find((line) => /^title\s*:/.test(line));
  if (!titleLine) {
    return markdown;
  }

  const title = decodeFrontmatterScalar(titleLine.replace(/^title\s*:\s*/, ''));
  if (!title) {
    return markdown;
  }

  const insertionPoint = frontmatter[0].length;
  return `${markdown.slice(0, insertionPoint)}\n# ${title}\n${markdown.slice(insertionPoint)}`;
}

function transformRootRelativeImages(markdown, sourcePath) {
  const staticPrefix =
    path.relative(path.dirname(sourcePath), 'static').split(path.sep).join('/') || '.';

  return markdown
    .replace(
      /(!\[[^\]]*\]\()\/(?!\/)([^)\s]+)([^)]*\))/g,
      (_match, opening, assetPath, remainder) =>
        `${opening}${staticPrefix}/${assetPath}${remainder}`,
    )
    .replace(
      /(<img\b[^>]*\bsrc=["'])\/(?!\/)([^"']+)/gi,
      (_match, opening, assetPath) => `${opening}${staticPrefix}/${assetPath}`,
    );
}

function assetName(baseName, locale, format) {
  return `${baseName}-${locale}.${format}`;
}

function publicAssetPath(baseName, locale, format) {
  const name = assetName(baseName, locale, format);
  return format === 'webpub' ? `${name}/` : name;
}

function outputTargets(baseName, locale, formats) {
  return formats.map((format) => ({
    path: path.join(outputRoot, assetName(baseName, locale, format)),
    format,
  }));
}

function publicationManifest(version) {
  const paths = new Set();
  const publications = Object.entries(config.publications).map(
    ([publicationName, publication]) => {
      const baseName = publication.outputName ?? publicationName;
      const locales = {};

      for (const [locale, localeConfig] of Object.entries(publication.locales)) {
        const formats = localeConfig.outputs.map((format) => {
          const assetPath = publicAssetPath(baseName, locale, format);
          const collisionKey = assetPath.replace(/\/$/, '');
          if (paths.has(collisionKey)) {
            throw new Error(`Publication output collision: ${collisionKey}`);
          }
          paths.add(collisionKey);
          return {format, path: assetPath};
        });

        locales[locale] = {
          title: localeConfig.title,
          formats,
        };
      }

      return {
        id: publicationName,
        outputName: baseName,
        revision: publication.revision ?? null,
        locales,
      };
    },
  );

  return {
    version,
    publications,
  };
}

function normalizeCover(cover) {
  if (!cover) {
    return null;
  }
  if (typeof cover === 'string') {
    return {image: cover, showTitle: true, showMetadata: true};
  }
  return {
    showTitle: true,
    showMetadata: true,
    ...cover,
  };
}

function licenseHtml(license) {
  if (!license) {
    return null;
  }

  const licenseLink = linkHtml(license);
  const attribution = license.attribution;
  if (!attribution) {
    return licenseLink;
  }

  const title = attribution.href
    ? `<a href="${escapeHtml(attribution.href)}">${escapeHtml(attribution.title)}</a>`
    : escapeHtml(attribution.title);
  const author = escapeHtml(attribution.author);
  return `${title} · ${author} · ${licenseLink}`;
}

function coverTitle(publication, localeConfig, cover) {
  if (!cover || cover.showTitle === false) {
    return null;
  }
  return localeConfig.coverTitle ?? cover.title ?? localeConfig.title;
}

async function writeCover(
  publicationWorkDir,
  publication,
  locale,
  localeConfig,
  themeDestination,
  version,
) {
  const cover = normalizeCover(publication.cover);
  if (!cover?.image) {
    return null;
  }

  const labels = publicationLabels[locale] ?? publicationLabels.en;
  const title = coverTitle(publication, localeConfig, cover);
  const metadata = [];

  if (cover.showMetadata !== false) {
    if (publication.author) {
      metadata.push(`<div class="publication-cover-author">${escapeHtml(publication.author)}</div>`);
    }

    const edition = [];
    if (version) {
      edition.push(`${escapeHtml(labels.version)} ${escapeHtml(version)}`);
    }
    if (publication.revision) {
      edition.push(`${escapeHtml(labels.revision)} ${escapeHtml(publication.revision)}`);
    }
    if (edition.length > 0) {
      metadata.push(`<div class="publication-cover-edition">${edition.join(' · ')}</div>`);
    }

    const license = licenseHtml(publication.license);
    if (license) {
      metadata.push(`<div class="publication-cover-license">${license}</div>`);
    }

    const lineage = [];
    const designedWith = linkHtml(publication.lineage?.designedWith);
    const poweredBy = linkHtml(publication.lineage?.poweredBy);
    if (designedWith) {
      lineage.push(`${escapeHtml(labels.designedWith)} ${designedWith}`);
    }
    if (poweredBy) {
      lineage.push(`${escapeHtml(labels.poweredBy)} ${poweredBy}`);
    }
    if (lineage.length > 0) {
      metadata.push(`<div class="publication-cover-lineage">${lineage.join(' · ')}</div>`);
    }
  }

  const coverPath = path.join(publicationWorkDir, 'publication-cover.html');
  const html = `<!doctype html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title ?? localeConfig.title)}</title>
</head>
<body class="publication-cover-document">
  <main class="publication-cover-page">
    ${title ? `<h1 class="publication-cover-title">${escapeHtml(title)}</h1>` : ''}
    <img role="doc-cover" />
    ${metadata.length > 0 ? `<footer class="publication-cover-metadata">${metadata.join('\n')}</footer>` : ''}
  </main>
</body>
</html>
`;

  await fs.writeFile(coverPath, html, 'utf8');
  return {
    entry: {
      rel: 'cover',
      path: 'publication-cover.html',
      output: 'cover.html',
      theme: themeDestination,
    },
    cover: {
      src: cover.image,
      name: title ?? localeConfig.title,
    },
  };
}

async function preparePublication(
  publicationName,
  publication,
  locale,
  localeConfig,
  version,
) {
  const publicationWorkDir = path.join(workRoot, publicationName, locale);
  await fs.rm(publicationWorkDir, {recursive: true, force: true});
  await fs.mkdir(publicationWorkDir, {recursive: true});

  const customAdmonitions = config.markdown?.admonitions ?? [];
  const contentEntries = [];

  for (const sourcePath of localeConfig.contents) {
    const sourceAbsolute = path.join(projectRoot, sourcePath);
    const destinationAbsolute = path.join(publicationWorkDir, sourcePath);
    const markdown = await fs.readFile(sourceAbsolute, 'utf8');
    const withChapterHeading = ensureDocumentTitleHeading(markdown);
    const withPortableImages = transformRootRelativeImages(withChapterHeading, sourcePath);
    const transformed = transformAdmonitions(withPortableImages, locale, customAdmonitions);

    await fs.mkdir(path.dirname(destinationAbsolute), {recursive: true});
    await fs.writeFile(destinationAbsolute, transformed, 'utf8');
    contentEntries.push(sourcePath);
  }

  const themeSource = path.join(projectRoot, publication.theme);
  const themeDestination = path.join(publicationWorkDir, 'theme.css');
  await fs.copyFile(themeSource, themeDestination);

  const staticSource = path.join(projectRoot, 'static');
  const staticDestination = path.join(publicationWorkDir, 'static');
  await fs.cp(staticSource, staticDestination, {recursive: true});

  const cover = await writeCover(
    publicationWorkDir,
    publication,
    locale,
    localeConfig,
    themeDestination,
    version,
  );
  const entries = [
    ...(cover ? [cover.entry] : []),
    {rel: 'contents'},
    ...contentEntries,
  ];

  const task = {
    title: localeConfig.title,
    author: publication.author,
    language: locale,
    size: publication.size ?? 'A4',
    entry: entries,
    entryContext: publicationWorkDir,
    theme: themeDestination,
    vfm: {
      rewriteRelativeHrefExtensions: true,
    },
    toc: {
      title: localeConfig.tocTitle ?? (locale === 'fr' ? 'Sommaire' : 'Contents'),
      sectionDepth: 2,
    },
    ...(cover ? {cover: cover.cover} : {}),
    output: outputTargets(publication.outputName ?? publicationName, locale, localeConfig.outputs),
    workspaceDir: '.vivliostyle',
    static: {
      '/': staticDestination,
    },
  };

  const configPath = path.join(publicationWorkDir, 'vivliostyle.config.json');
  await fs.writeFile(configPath, JSON.stringify(task, null, 2), 'utf8');
  return configPath;
}

async function main() {
  await fs.rm(workRoot, {recursive: true, force: true});
  await fs.rm(outputRoot, {recursive: true, force: true});
  await fs.mkdir(outputRoot, {recursive: true});

  const version = resolvePublicationVersion();
  const manifest = publicationManifest(version);
  console.log(`Building publication corpus version ${version}...`);

  for (const [publicationName, publication] of Object.entries(config.publications)) {
    for (const [locale, localeConfig] of Object.entries(publication.locales)) {
      console.log(`Building ${publicationName} (${locale})...`);
      const configPath = await preparePublication(
        publicationName,
        publication,
        locale,
        localeConfig,
        version,
      );
      await build({config: configPath, logLevel: 'info'});
    }
  }

  await fs.writeFile(
    path.join(outputRoot, 'publications.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`Publications written to ${path.relative(projectRoot, outputRoot)}/`);
}

await main();

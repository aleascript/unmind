# Publications

Unmind uses the Markdown files in `docs/` as the canonical editorial source for both the Docusaurus site and downloadable publications.

## Configuration

`publications.config.mjs` defines the publication independently from the website sidebar. The current corpus publishes one A5 book, `Unmind`, in English and French, with an explicit editorial order:

1. introduction;
2. rules;
3. booklets overview;
4. Watch;
5. Serve;
6. Please;
7. Fade;
8. Order;
9. Resist.

The output name is `unmind`; each locale currently produces PDF only. The cover uses the black Unmind publication logo and deliberately hides the generated cover title so the word **Unmind** is not repeated.

The publication keeps the project metadata already used by the site: AleaScript as author, CC BY 4.0, and `designed with Resonance` with no powered-by credit. `revision` is editorial metadata and currently remains `Draft`.

## Versioning

Publication versioning is repository-wide and lockstep. The builder resolves the corpus version in this order:

1. `PUBLICATION_VERSION`, supplied during release preparation;
2. the latest Git tag matching `vX.Y.Z`;
3. `release.initialVersion` from `publications.config.mjs`.

Unmind starts at `0.1.0`. The private npm package is not published.

After the first real release exists, Conventional Commits drive Semantic Release:

- `fix:` and `revert:` create a patch release;
- `feat:` creates a minor release;
- a breaking marker creates a major release;
- `docs:`, `chore:`, `ci:`, `build:`, `test:`, `style:`, `refactor:`, and `perf:` do not create a release.

For this repository, game content is product content. A published rule change should therefore normally use `fix:` or `feat:` rather than `docs:`.

## Build

Install dependencies and run:

```bash
npm run publication:build
```

The build writes:

- `dist/publications/unmind-en.pdf`;
- `dist/publications/unmind-fr.pdf`;
- `dist/publications/publications.json`.

To copy an already-built corpus into an already-built Docusaurus site:

```bash
npm run publication:site
```

This copies the complete publication directory into `build/downloads/`.

## Markdown portability

`tools/build-publications.mjs` is shared with the current `resonance-site-template` implementation. It transforms only temporary publication copies; authored Markdown is never rewritten.

Supported Docusaurus admonitions are `note`, `tip`, `info`, `warning`, `danger`, `caution`, plus the configured `design` type. Unsupported directives fail the build rather than degrading silently.

The shared builder also:

- inserts an H1 from frontmatter `title` when a source document has no explicit H1;
- rewrites root-relative Markdown and HTML image paths so assets under `static/` remain portable in generated publications;
- rewrites relative Markdown document links to their generated HTML targets so links between chapters remain internal PDF destinations instead of preview-server URLs.

## Publication identity

`publication/theme.css` is intentionally specific to Unmind rather than a generic Resonance recolor. It uses the restrained green/grey clinical palette, Arial/Helvetica body text, Georgia headings, thin rules, institutional labels and an A5 document treatment. The logo is the only title treatment on the cover; metadata is kept separate below it.

## Catalogue and deployment

The Docusaurus `/publications/` page reads the shared manifest from the deployment-root `/downloads/publications.json`. `deploymentBaseUrl` in `docusaurus.config.ts` prevents localized routes from incorrectly looking for the manifest below `/fr/`.

The catalogue is linked from both the main navbar and the docs Contents menu. The Contents link is promoted near the top rather than buried after the game corpus.

## CI and releases

The Pages workflow runs on pull requests and on `main`.

On pull requests it:

- installs dependencies;
- typechecks;
- builds the localized site;
- builds both PDFs;
- uploads the publication corpus as a validation artifact;
- runs Semantic Release in dry-run mode without creating a release.

On the first successful `main` run with no real `vX.Y.Z` tag, it prepares and creates `v0.1.0` directly on the merged commit. No technical `v0.0.0` tag is pushed.

Subsequent `main` runs use Semantic Release. Release preparation rebuilds the complete corpus with the exact release version, rebuilds the site, copies publications into `build/downloads/`, attaches the PDFs and manifest to the GitHub Release, and deploys the resulting site to GitHub Pages.

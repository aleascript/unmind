# Publication migration handoff — Unmind

This file is an execution prompt for a future ChatGPT conversation. The PR containing it is intentionally **not the implementation**.

When resuming work, use the current branch of this PR as the implementation branch. Once the migration is complete and validated, remove this handoff file before the final merge.

## Goal

Add the full publication and release pipeline to **Unmind**, using the current `aleascript/resonance-site-template` as the generic baseline and `aleascript/regard` as the first production reference.

The result must publish the existing EN/FR Unmind corpus as:

- PDF — mandatory;
- EPUB;
- WebPub served by the site;
- a `/publications/` catalogue page;
- GitHub Release assets for PDF, EPUB and `publications.json`;
- a Semantic Release based repository-wide publication version.

Do not redesign or rewrite the game content as part of this migration.

## First: inspect current sources, do not assume

Before changing anything:

1. Read the current `main` of:
   - `aleascript/unmind`;
   - `aleascript/resonance-site-template`;
   - `aleascript/regard`.
2. Compare the publication implementation in Regard with the template. Regard has already exposed generic issues that may not yet have been upstreamed to the template.
3. In particular, verify whether the template builder already contains the generic fixes used by Regard for:
   - adding a Markdown H1 from frontmatter when a source page has no explicit H1;
   - rewriting root-relative Markdown/HTML image paths such as `/img/...` so they remain portable in PDF/EPUB/WebPub.
4. If a fix is genuinely generic and still exists only in Regard, prefer a small PR to `resonance-site-template` first, then consume the improved template from Unmind rather than copying a divergence.

Do not cherry-pick the historical template PR sequence. Port the **current learned state** intentionally.

## Current Unmind facts to preserve

Current project metadata in `site.config.ts`:

- title: `Unmind`;
- tagline: `You are not here by mistake.`;
- author: `AleaScript`;
- locales: EN + FR, English default;
- license metadata: CC BY 4.0;
- lineage: designed with Resonance, no `poweredBy`;
- identity has no logo and no favicon;
- visual identity is restrained, clinical and institutional: desaturated green/grey, Arial/Helvetica body, Georgia headings, small radius and thin borders.

Do not turn the publication into a generic Resonance recolor. The print identity should feel like **Unmind**: austere, controlled, clinical, slightly oppressive, readable.

## Publication composition

Do not derive publication order dynamically from the Docusaurus sidebar. Encode it explicitly in `publications.config.mjs`.

Use the current sidebar order as the initial editorial intent unless the source has changed by execution time:

1. `docs/<locale>/index.md`
2. `docs/<locale>/rules.md`
3. `docs/<locale>/booklets.md`
4. `docs/<locale>/watch.md`
5. `docs/<locale>/serve.md`
6. `docs/<locale>/please.md`
7. `docs/<locale>/fade.md`
8. `docs/<locale>/order.md`
9. `docs/<locale>/resist.md`

The web navigation and book composition must remain independent after migration.

## Important Unmind-specific design test: cover without a logo

Unmind currently has no logo. **Do not invent one merely because the publication builder expects an image.**

Prefer a typographic / clinical cover using the existing identity. If the current generic builder requires `cover.image`, treat that as an abstraction problem:

- extend the generic publication cover mechanism so a cover image is optional;
- support a text-only cover cleanly;
- upstream that capability to `resonance-site-template` if it is generic;
- then use it in Unmind.

This is an intended template stress test.

A5 is a reasonable starting format for this short closed game, but validate the actual result visually rather than treating the size as doctrine.

## Infrastructure to port

Use the latest template/Regard implementation as reference for all publication infrastructure, including at minimum:

- `publications.config.mjs`;
- publication CSS/theme and cover support;
- `tools/build-publications.mjs` and the release/copy helpers;
- the `/publications/` Docusaurus page;
- `deploymentBaseUrl` handling so localized pages load the shared `/downloads/publications.json` from the deployment root;
- package scripts and Vivliostyle / Semantic Release dependencies;
- `.releaserc.json`;
- CI validation on PRs;
- production release + Pages deployment workflow;
- publication artifact upload;
- `PUBLICATIONS.md` or current equivalent documentation from the template.

Preserve Unmind-specific site CSS, Root components, assets and `site.config.ts` identity unless a generic migration requires a careful merge.

The existing `docusaurus.config.ts` still has `pages: false`; enable pages as part of the migration.

## Navigation requirement learned from Regard

The publication catalogue must not merely exist; it must be easy to discover.

Ensure `Publications` is:

- visible in the main navbar;
- visible in the docs/Contents menu without requiring the user to scroll through the whole corpus first — preferably promoted near the top;
- correct in both EN and FR.

Do not repeat the earlier Regard state where the link technically existed but was buried after the whole SRD.

## Versioning and release behavior

At the time this handoff was created, Unmind has no GitHub Releases. Re-check this before implementation.

If there is still no real `vX.Y.Z` baseline:

- set `release.initialVersion` to `0.1.0`;
- the implementation PR should ultimately be merged with a release-triggering Conventional Commit such as `feat: add publication and release pipeline`;
- the first production run should create the real `v0.1.0` tag/release directly on the merged `main` commit;
- never push a technical `v0.0.0` bootstrap tag.

After the first release, use Semantic Release normally:

- `fix:` → patch;
- `feat:` → minor;
- breaking change → major;
- `docs:`, `chore:`, `ci:`, `build:`, `test:`, `style:`, `refactor:`, `perf:` → no release under the current project policy.

The npm package remains private/unpublished. Version is release-level; editorial `revision` is separate.

## Expected publication metadata

Use project metadata rather than duplicating invented values:

- output name: `unmind`;
- title: `Unmind` in both locales unless the source now says otherwise;
- author: `AleaScript`;
- license: current CC BY 4.0 metadata;
- lineage: designed with Resonance; no powered-by entry;
- initial editorial revision may remain `Draft` if that is still appropriate at implementation time.

## Validation before merge

Do not merge merely because Vivliostyle exits successfully.

The implementation conversation must:

1. run typecheck and localized Docusaurus builds;
2. build PDF + EPUB + WebPub for EN and FR;
3. inspect the generated PDFs visually, including cover, TOC, page breaks, typography, any admonitions and any images;
4. make the actual EN/FR PDF artifacts available for review before merge;
5. verify PR Semantic Release dry-run behavior;
6. ensure no release is created from the PR itself;
7. after merge, verify the real GitHub Release, its assets, the manifest version and GitHub Pages deployment;
8. verify the exact deployed Pages artifact if direct live HTTP verification is ambiguous;
9. confirm localized `/publications/` works with the shared deployment-root downloads path.

Any new generic issue discovered by Unmind should be considered for upstreaming to `resonance-site-template` before duplicating the workaround elsewhere.

## Completion condition

The migration is complete when Unmind has a production-quality EN/FR publication pipeline, a discoverable publication catalogue, a visually coherent Unmind PDF, correct release semantics, and no project-specific workaround that should instead live in the shared template.

Before final merge, delete `PUBLICATION_MIGRATION_PROMPT.md` from this branch.
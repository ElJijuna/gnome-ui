import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const README_PATH = join(root, 'README.md');
const STORYBOOK_BASE = 'https://gnome-ui.org';
const checkOnly = process.argv.includes('--check');

const PACKAGES = ['react', 'layout', 'charts'];
const REACT_NATIVE_ROADMAP_PATH = join(root, 'packages', 'react-native', 'ROADMAP.md');
const WEB_COMPONENTS_ROADMAP_PATH = join(root, 'packages', 'web-components', 'ROADMAP.md');
const NOT_TRACKED = '—';

// ─── Ported from packages/website/scripts/generate-registry.mjs ───────────
// (deleted when the old catalog site was replaced by this repo's MkDocs
// site) — its slug algorithm was verified against a real Storybook build,
// so it's reused rather than re-derived.

/** Mirrors Storybook's own title → id slug algorithm, verified against a real build. */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Un-soft-wraps markdown prose: single newlines within a paragraph become spaces. */
function joinProse(lines) {
  return (
    lines
      .join('\n')
      .split(/\n{2,}/)[0]
      ?.split('\n')
      .map((line) => line.trim())
      .join(' ')
      .trim() ?? ''
  );
}

/** Description for a per-component README: leading paragraph, before the first heading or code fence. */
function extractDescription(markdown) {
  const lines = [];

  for (const line of markdown.split('\n')) {
    if (/^#{1,6}\s/.test(line) || line.trim().startsWith('```')) {
      break;
    }

    lines.push(line);
  }

  return joinProse(lines);
}

/** Extracts a story file's `title` and whether it's tagged `autodocs`. */
function extractStorybookMeta(storiesSource) {
  const titleMatch = storiesSource.match(/title:\s*['"]([^'"]+)['"]/);

  if (!titleMatch) {
    return undefined;
  }

  const hasAutodocs = /tags:\s*\[[^\]]*['"]autodocs['"][^\]]*\]/.test(storiesSource);

  return { title: titleMatch[1], hasAutodocs };
}

/** Best-effort Storybook deep link — falls back to the package's Storybook root when unsure. */
function buildStorybookUrl(packageId, storiesSource) {
  const base = `${STORYBOOK_BASE}/${packageId}/`;

  if (!storiesSource) {
    return base;
  }

  const meta = extractStorybookMeta(storiesSource);

  if (!meta || !meta.hasAutodocs) {
    return base;
  }

  return `${base}?path=/docs/${slugify(meta.title)}--docs`;
}

// ─── Cross-package port status ──────────────────────────────────────────
//
// `packages/react-native/ROADMAP.md` and `packages/web-components/ROADMAP.md`
// are the authoritative, hand-maintained per-package port trackers (own
// status legend, own notes) — this only extracts the one ✅/🚧/⬜/🚫 symbol
// per `@gnome-ui/react` component name from each, to surface as two extra
// columns on the main component table rather than as a fourth, separately
// hand-maintained matrix that could drift from those two files the way the
// `react-native` one was found to have drifted from the actual component
// list itself (twice, via a manual audit — see that file's own Summary).

/**
 * `react-native/ROADMAP.md` rows look like `| ✅ | **Name** | notes |` (most
 * tiers) or `| ✅ | Name | |` (the Tier 1–5 shorthand rows, no bold, no
 * notes — sometimes followed by a second name in the same cell, e.g.
 * `Tabs / TabBar`, so the plain form only anchors the leading word, not
 * the whole cell). First match per name wins if a name were ever listed
 * twice.
 */
function parseReactNativeStatuses(markdown) {
  const statuses = new Map();
  const boldRow = /^\|\s*(✅|⬜|🚫|🚧)\s*\|\s*\*\*([A-Za-z][A-Za-z0-9]*)\*\*/;
  const plainRow = /^\|\s*(✅|⬜|🚫|🚧)\s*\|\s*([A-Za-z][A-Za-z0-9]*)/;

  for (const line of markdown.split('\n')) {
    const match = boldRow.exec(line) ?? plainRow.exec(line);

    if (match && !statuses.has(match[2])) {
      statuses.set(match[2], match[1]);
    }
  }

  return statuses;
}

/**
 * `web-components/ROADMAP.md` rows aren't a single consistent shape — the
 * "Shipped (Foundation)" table is `| Status | Element | Ported from |`
 * (status first), but every tier table below it is
 * `| Priority | Status | Element | Ported from | Notes |` (status
 * *second*). Rather than match a fixed column position, split each row
 * into cells and find whichever one is a bare status symbol, then take
 * the cell right after the `` `<gnome-x>` `` custom-element name as
 * "Ported from" — position-agnostic, so it doesn't silently miss an
 * entire table shape the way a fixed-column regex did on the first pass
 * (it only found the 24 rows in the first table, not the 59 across all of
 * them). The "Ported from" cell sometimes lists more than one source,
 * e.g. `` `Dialog` / `AlertDialog` `` — every backtick-wrapped name in it
 * maps to that row's status.
 */
function parseWebComponentsStatuses(markdown) {
  const statuses = new Map();
  const statusSymbols = new Set(['✅', '⬜', '🚫', '🚧']);

  for (const line of markdown.split('\n')) {
    if (!line.trim().startsWith('|')) {
      continue;
    }

    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    const status = cells.find((cell) => statusSymbols.has(cell));
    const elementIndex = cells.findIndex((cell) => /^`<[^>]+>`$/.test(cell));

    if (!status || elementIndex === -1) {
      continue;
    }

    const portedFromCell = cells[elementIndex + 1] ?? '';

    for (const nameMatch of portedFromCell.matchAll(/`([A-Za-z][A-Za-z0-9]*)`/g)) {
      if (!statuses.has(nameMatch[1])) {
        statuses.set(nameMatch[1], status);
      }
    }
  }

  return statuses;
}

// ─── Component discovery ────────────────────────────────────────────────

function listComponentDirs(componentsRoot) {
  if (!existsSync(componentsRoot)) {
    return [];
  }

  return readdirSync(componentsRoot).filter((name) =>
    statSync(join(componentsRoot, name)).isDirectory(),
  );
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}

function escapeTableCell(text) {
  return text.replace(/\|/g, '\\|');
}

function buildComponentEntries(packageId, crossPackageStatus) {
  const componentsRoot = join(root, 'packages', packageId, 'src', 'components');

  return listComponentDirs(componentsRoot)
    .map((name) => {
      const dir = join(componentsRoot, name);
      const readme = readIfExists(join(dir, 'README.md'));

      if (readme === undefined) {
        return undefined;
      }

      const storiesFile = readdirSync(dir).find((file) => file.endsWith('.stories.tsx'));
      const storiesSource = storiesFile ? readFileSync(join(dir, storiesFile), 'utf8') : undefined;

      return {
        name,
        description: escapeTableCell(extractDescription(readme)),
        storybookUrl: buildStorybookUrl(packageId, storiesSource),
        reactNative: crossPackageStatus?.reactNative.get(name) ?? NOT_TRACKED,
        webComponents: crossPackageStatus?.webComponents.get(name) ?? NOT_TRACKED,
      };
    })
    .filter((entry) => entry !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderTable(entries, { crossPackageColumns } = {}) {
  const header = crossPackageColumns
    ? '| Component | Description | React Native | Web Components | Story |\n' +
      '|-----------|-------------|:------------:|:---------------:|-------|'
    : '| Component | Description | Story |\n|-----------|-------------|-------|';

  const rows = entries.map((entry) =>
    crossPackageColumns
      ? `| \`${entry.name}\` | ${entry.description} | ${entry.reactNative} | ${entry.webComponents} | [Docs](${entry.storybookUrl}) |`
      : `| \`${entry.name}\` | ${entry.description} | [Docs](${entry.storybookUrl}) |`,
  );

  return [header, ...rows].join('\n');
}

function updateSection(content, markerName, table) {
  const start = `<!-- component-table:${markerName} -->`;
  const end = `<!-- /component-table:${markerName} -->`;
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Missing marker pair "${start}" / "${end}" in README.md`);
  }

  const before = content.slice(0, startIndex + start.length);
  const after = content.slice(endIndex);

  return `${before}\n${table}\n${after}`;
}

const current = readFileSync(README_PATH, 'utf8');
let generated = current;

const crossPackageStatus = {
  reactNative: parseReactNativeStatuses(readFileSync(REACT_NATIVE_ROADMAP_PATH, 'utf8')),
  webComponents: parseWebComponentsStatuses(readFileSync(WEB_COMPONENTS_ROADMAP_PATH, 'utf8')),
};

for (const packageId of PACKAGES) {
  const crossPackageColumns = packageId === 'react';
  const entries = buildComponentEntries(packageId, crossPackageColumns ? crossPackageStatus : undefined);

  generated = updateSection(generated, packageId, renderTable(entries, { crossPackageColumns }));
}

if (checkOnly) {
  if (current !== generated) {
    console.error(
      `${relative(root, README_PATH)} is out of date. Run \`npm run tables:generate\` and commit it.`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(README_PATH, generated);
  console.log(`Generated component tables in ${relative(root, README_PATH)}.`);
}

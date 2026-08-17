import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const README_PATH = join(root, 'README.md');
const STORYBOOK_BASE = 'https://gnome-ui.org';
const checkOnly = process.argv.includes('--check');

const PACKAGES = ['react', 'layout', 'charts'];

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

function buildComponentEntries(packageId) {
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
      };
    })
    .filter((entry) => entry !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderTable(entries) {
  const header = '| Component | Description | Story |\n|-----------|-------------|-------|';
  const rows = entries.map(
    (entry) => `| \`${entry.name}\` | ${entry.description} | [Docs](${entry.storybookUrl}) |`,
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

for (const packageId of PACKAGES) {
  const entries = buildComponentEntries(packageId);
  generated = updateSection(generated, packageId, renderTable(entries));
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

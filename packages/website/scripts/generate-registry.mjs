#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, '..', '..', '..');
export const STORYBOOK_BASE = 'https://eljijuna.github.io/gnome-ui';

// ─── Pure parsing helpers ──────────────────────────────────────────────────

/** Mirrors Storybook's own title → id slug algorithm, verified against a real build. */
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Un-soft-wraps markdown prose: single newlines within a paragraph become spaces, blank lines still separate paragraphs. */
function joinProse(lines) {
  return lines
    .join('\n')
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph
        .split('\n')
        .map((line) => line.trim())
        .join(' ')
        .trim(),
    )
    .filter(Boolean)
    .join('\n\n');
}

/** Description for a per-component README: everything before the first heading or code fence. */
export function extractDescription(markdown) {
  const lines = [];

  for (const line of markdown.split('\n')) {
    if (/^#{1,6}\s/.test(line) || line.trim().startsWith('```')) {
      break;
    }

    lines.push(line);
  }

  return joinProse(lines);
}

/**
 * Description for a top-level package README: skips the leading `#` title,
 * any `<...>` HTML block (the centered logo image), blank lines, and the
 * badges line, landing on the first real prose paragraph.
 */
export function extractPackageDescription(markdown) {
  const paragraph = [];
  let started = false;

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();

    if (!started) {
      if (
        trimmed === '' ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('<') ||
        trimmed.startsWith('[![')
      ) {
        continue;
      }

      started = true;
    }

    if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('[![')) {
      break;
    }

    paragraph.push(line);
  }

  return joinProse(paragraph);
}

/** First ```tsx fenced block, if any. */
export function extractExample(markdown) {
  const match = markdown.match(/```tsx\n([\s\S]*?)```/);

  return match ? match[1].trim() : undefined;
}

function splitTableRow(line) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'));
}

/** Parses the `### Props` markdown table into an array of row objects, if present. */
export function extractPropsTable(markdown) {
  const headingMatch = markdown.match(/^#{2,4}\s+Props\s*$/m);

  if (!headingMatch) {
    return undefined;
  }

  const after = markdown.slice(headingMatch.index + headingMatch[0].length);
  const tableLines = [];

  for (const rawLine of after.split('\n')) {
    const trimmed = rawLine.trim();

    if (!trimmed.startsWith('|')) {
      if (tableLines.length > 0) {
        break;
      }

      continue;
    }

    tableLines.push(trimmed);
  }

  if (tableLines.length < 2) {
    return undefined;
  }

  const headers = splitTableRow(tableLines[0]);
  const rows = tableLines.slice(2).map(splitTableRow);

  return rows.map((cells) =>
    Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ''])),
  );
}

/** The `## Installation` section's fenced shell command, if present. */
export function extractInstallCommand(markdown) {
  const headingMatch = markdown.match(/^#{2,4}\s+Installation\s*$/m);

  if (!headingMatch) {
    return undefined;
  }

  const after = markdown.slice(headingMatch.index + headingMatch[0].length);
  const codeMatch = after.match(/```(?:bash|sh)?\n([\s\S]*?)```/);

  return codeMatch ? codeMatch[1].trim() : undefined;
}

/**
 * `@gnome-ui/hooks` documents every hook in one shared README table (under
 * `## Hooks`, split across a few `###` subsections) rather than per-hook
 * READMEs like react/layout/charts — parses every table row between
 * `## Hooks` and the next `##`-level heading.
 */
export function extractHookRows(markdown) {
  const hooksHeadingMatch = markdown.match(/^## Hooks\s*$/m);

  if (!hooksHeadingMatch) {
    return [];
  }

  const start = hooksHeadingMatch.index + hooksHeadingMatch[0].length;
  const nextSectionMatch = markdown.slice(start).match(/^## /m);
  const section = nextSectionMatch
    ? markdown.slice(start, start + nextSectionMatch.index)
    : markdown.slice(start);

  const rows = [];
  let currentTable = [];

  const flush = () => {
    if (currentTable.length >= 2) {
      const headers = splitTableRow(currentTable[0]);

      for (const line of currentTable.slice(2)) {
        const cells = splitTableRow(line);

        rows.push(Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ''])));
      }
    }

    currentTable = [];
  };

  for (const rawLine of section.split('\n')) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('|')) {
      currentTable.push(trimmed);
    } else if (currentTable.length > 0) {
      flush();
    }
  }

  flush();

  return rows;
}

/** Finds the first `## Examples` code block that imports the given hook by name. */
export function extractHookExample(markdown, hookName) {
  const examplesHeadingMatch = markdown.match(/^## Examples\s*$/m);

  if (!examplesHeadingMatch) {
    return undefined;
  }

  const section = markdown.slice(examplesHeadingMatch.index);
  const nameRe = new RegExp(`\\b${hookName}\\b`);

  for (const match of section.matchAll(/```tsx\n([\s\S]*?)```/g)) {
    const block = match[1].trim();

    if (nameRe.test(block)) {
      return block;
    }
  }

  return undefined;
}

/** Extracts a story file's `title` and whether it's tagged `autodocs`. */
export function extractStorybookMeta(storiesSource) {
  const titleMatch = storiesSource.match(/title:\s*['"]([^'"]+)['"]/);

  if (!titleMatch) {
    return undefined;
  }

  const hasAutodocs = /tags:\s*\[[^\]]*['"]autodocs['"][^\]]*\]/.test(storiesSource);

  return { title: titleMatch[1], hasAutodocs };
}

/** Best-effort Storybook deep link — falls back to the package's Storybook root when unsure. */
export function buildStorybookUrl(packageId, storiesSource) {
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

// ─── Filesystem walking ─────────────────────────────────────────────────────

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

function toSlug(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function buildComponentEntries(packageId) {
  const componentsRoot = join(REPO_ROOT, 'packages', packageId, 'src', 'components');

  return listComponentDirs(componentsRoot)
    .map((name) => {
      const dir = join(componentsRoot, name);
      const readme = readIfExists(join(dir, 'README.md'));

      if (readme === undefined) {
        return undefined;
      }

      const storiesPath = readdirSync(dir).find((file) => file.endsWith('.stories.tsx'));
      const storiesSource = storiesPath ? readFileSync(join(dir, storiesPath), 'utf8') : undefined;

      return {
        slug: toSlug(name),
        package: packageId,
        name,
        description: extractDescription(readme),
        example: extractExample(readme),
        props: extractPropsTable(readme),
        storybookUrl: buildStorybookUrl(packageId, storiesSource),
      };
    })
    .filter((entry) => entry !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildHookEntries() {
  const readme = readIfExists(join(REPO_ROOT, 'packages', 'hooks', 'README.md'));

  if (readme === undefined) {
    return [];
  }

  return extractHookRows(readme)
    .map((row) => {
      const signature = row.Hook ?? '';
      const nameMatch = signature.match(/use[A-Za-z]+/);

      if (!nameMatch) {
        return undefined;
      }

      const [name] = nameMatch;

      return {
        slug: toSlug(name),
        name: signature.replace(/`/g, ''),
        description: row.Description ?? '',
        example: extractHookExample(readme, name),
      };
    })
    .filter((entry) => entry !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildPackageEntry(id, { storybook = false, componentCount } = {}) {
  const packageDir = join(REPO_ROOT, 'packages', id);
  const packageJson = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
  const readme = readIfExists(join(packageDir, 'README.md'));

  return {
    id,
    packageName: packageJson.name,
    version: packageJson.version,
    description: readme ? extractPackageDescription(readme) : '',
    installCommand: readme ? extractInstallCommand(readme) : undefined,
    storybookUrl: storybook ? `${STORYBOOK_BASE}/${id}/` : undefined,
    componentCount,
  };
}

// ─── Entry point ────────────────────────────────────────────────────────────

export function generateRegistry() {
  const components = [
    ...buildComponentEntries('react'),
    ...buildComponentEntries('layout'),
    ...buildComponentEntries('charts'),
  ];
  const hooks = buildHookEntries();

  const componentCountByPackage = components.reduce((counts, entry) => {
    counts[entry.package] = (counts[entry.package] ?? 0) + 1;

    return counts;
  }, {});

  const packages = [
    buildPackageEntry('react', { storybook: true, componentCount: componentCountByPackage.react }),
    buildPackageEntry('layout', {
      storybook: true,
      componentCount: componentCountByPackage.layout,
    }),
    buildPackageEntry('charts', {
      storybook: true,
      componentCount: componentCountByPackage.charts,
    }),
    buildPackageEntry('icons', { storybook: true }),
    buildPackageEntry('web-components', { storybook: true }),
    buildPackageEntry('hooks', { componentCount: hooks.length }),
    buildPackageEntry('platform'),
    buildPackageEntry('core'),
    buildPackageEntry('cli'),
  ];

  return { components, hooks, packages };
}

function serialize(value) {
  return JSON.stringify(value, null, 2);
}

function writeRegistryFile() {
  const { components, hooks, packages } = generateRegistry();
  const outDir = join(__dirname, '..', 'src', 'generated');

  mkdirSync(outDir, { recursive: true });

  const banner = '// Generated by scripts/generate-registry.mjs — do not edit by hand.\n';
  const body = `${banner}import type { ComponentEntry, HookEntry, PackageEntry } from '@/types/registry';

export const components: ComponentEntry[] = ${serialize(components)};

export const hooks: HookEntry[] = ${serialize(hooks)};

export const packages: PackageEntry[] = ${serialize(packages)};
`;

  writeFileSync(join(outDir, 'registry.ts'), body, 'utf8');
  console.log(
    `Generated registry: ${components.length} components, ${hooks.length} hooks, ${packages.length} packages.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeRegistryFile();
}

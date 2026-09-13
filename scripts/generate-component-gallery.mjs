#!/usr/bin/env node
/**
 * Regenerates docs/component-gallery.md from source: one section per
 * component that ships on at least one platform, with a tab per platform
 * it's actually available on (React / React Native / Web Components).
 *
 * Sources of truth (no hand-authored content, so this stays correct as
 * components are added — re-run after shipping a new one):
 *  - React:          packages/react/src/components/<Name>/README.md
 *                     (first ```tsx fence) for the code sample; the live
 *                     iframe + "Full docs" link come from the DEPLOYED
 *                     Storybook's own `index.json` manifest (see below).
 *  - React Native:    packages/react-native/README.md, "### <Name>"
 *                     section (first ```tsx fence). No web-viewable
 *                     Storybook, so no iframe — code + a link to that
 *                     section instead.
 *  - Web Components:  packages/web-components/README.md, "## <Title Case>"
 *                     section (first ```html fence, falling back to ```js
 *                     /```ts); iframe + docs link from the manifest, same
 *                     as React.
 *
 * Why the deployed manifest, not local `.stories` regex parsing: Storybook's
 * real `toId()` slugifies a JS export name by splitting camelCase into
 * hyphenated words (`ReadOnly` -> `read-only`) but leaves a `title:` path
 * segment glued together (`StepIndicator` -> `stepindicator`, no hyphen) —
 * two different rules depending on which string is being slugified. Trying
 * to reproduce both rules locally produced a wrong, 404ing story ID on the
 * first real check (confirmed against the deployed site). Every Storybook
 * publishes `index.json` listing every story's real `id`, `importPath`, and
 * `exportName` — matching on `importPath` (which we can compute exactly
 * from the local file) sidesteps slugification guessing entirely.
 *
 * A component with no curated README snippet on a platform still gets a
 * section (with a generic `<Name />` fallback) rather than being dropped —
 * coverage matters more here than every snippet being hand-polished; the
 * live demo and "Full docs & controls" link carry the real usage details.
 * Likewise, a component whose manifest lookup comes up empty (deploy is
 * stale, or it hasn't shipped there yet) still gets its code panel — it
 * just has no live iframe, rather than guessing a story ID that 404s.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REACT_DIR = path.join(ROOT, 'packages/react/src/components');
const RN_DIR = path.join(ROOT, 'packages/react-native/src/components');
const WC_DIR = path.join(ROOT, 'packages/web-components/src');
const RN_README = path.join(ROOT, 'packages/react-native/README.md');
const WC_README = path.join(ROOT, 'packages/web-components/README.md');
const OUT_FILE = path.join(ROOT, 'docs/component-gallery.md');

// Directories/files that exist alongside components but aren't themselves
// a gallery-able visual component.
const REACT_EXCLUDE = new Set(['GnomeProvider']);
const WC_EXCLUDE_BASENAMES = new Set(['index', 'style.d']);

// A few components ship under a different name/composition on another
// platform than a mechanical name transform would guess — e.g. React's
// `RadioButton` is Web Components' `RadioGroup` (host-generated group,
// not a single button). Keyed by the React (canonical) name.
const WC_NAME_ALIASES = {
  RadioButton: 'RadioGroup',
};

// A handful of components don't get their own top-level React directory —
// they're a secondary export co-located inside a sibling component's folder
// (e.g. `Spacer` ships from `Toolbar/Spacer.tsx`, since it's only ever used
// alongside one). Keyed by the component's own name; `dir` is the folder to
// look in instead of `packages/react/src/components/<Name>`.
const REACT_COLOCATED = {
  Spacer: { dir: 'Toolbar' },
};

// Components with no React implementation at all — Web-Components-only or
// React-Native-only widgets (a mobile bottom tab bar, a host-generated menu
// that React composes differently). Listed explicitly since there's no
// directory to discover them from on the React side.
const NON_REACT_COMPONENTS = [
  { name: 'BottomTabBar', platforms: ['rn'] },
  { name: 'Menu', platforms: ['wc'] },
  { name: 'TabBar', platforms: ['wc'] },
];

function normSig(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** PascalCase -> kebab-case, treating a run of capitals as one unit (`OTPInput` -> `otp-input`). */
function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function readFile(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

/** First fenced code block matching one of `langs`, verbatim (no trailing newline). */
function firstFence(markdown, langs) {
  if (!markdown) {
    return null;
  }
  const re = new RegExp('```(' + langs.join('|') + ')\\n([\\s\\S]*?)```', 'm');
  const m = markdown.match(re);
  return m ? { lang: m[1], code: m[2].replace(/\n+$/, '') } : null;
}

/** Slice `### Name` (or `## Name`) ... up to the next heading of the same or shallower level. */
function headingSection(markdown, level, name) {
  const marker = '#'.repeat(level) + ' ';
  const lines = markdown.split('\n');
  const target = normSig(name);
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith(marker)) {
      continue;
    }

    // A heading can name more than one export sharing a section, e.g.
    // "### Toast / Toaster" — match if any slash-separated part is it.
    const parts = lines[i].slice(marker.length).split('/');

    if (parts.some((p) => normSig(p) === target)) {
      start = i + 1;
      break;
    }
  }

  if (start === -1) {
    return null;
  }

  let end = lines.length;

  for (let i = start; i < lines.length; i++) {
    if (/^#{1,6} /.test(lines[i]) && lines[i].match(/^#+/)[0].length <= level) {
      end = i;
      break;
    }
  }

  return lines.slice(start, end).join('\n');
}

/** Fetches a deployed Storybook's `index.json` and groups entries by `importPath`. */
async function fetchManifest(baseUrl) {
  const res = await fetch(`${baseUrl}/index.json`);

  if (!res.ok) {
    throw new Error(`${baseUrl}/index.json → HTTP ${res.status}`);
  }

  const { entries } = await res.json();
  const byImportPath = new Map();

  for (const entry of Object.values(entries)) {
    const list = byImportPath.get(entry.importPath) ?? [];

    list.push(entry);
    byImportPath.set(entry.importPath, list);
  }

  return byImportPath;
}

/**
 * Looks up the real, deployed story for a local `.stories` file by its
 * `importPath` (computed relative to the package root, matching the
 * manifest's own format) — no local slugification/guessing involved.
 */
function resolveStory(manifest, pkgRoot, storiesFilePath) {
  if (!manifest || !fs.existsSync(storiesFilePath)) {
    return null;
  }

  const importPath = './' + path.relative(pkgRoot, storiesFilePath).split(path.sep).join('/');
  const entries = manifest.get(importPath);

  if (!entries || entries.length === 0) {
    return null;
  }

  const docsEntry = entries.find((e) => e.type === 'docs');
  const storyEntries = entries.filter((e) => e.type !== 'docs');
  const chosen = storyEntries.find((e) => e.exportName === 'Default') ?? storyEntries[0];

  if (!chosen) {
    return null;
  }

  return { storyId: chosen.id, docsId: docsEntry?.id ?? null };
}

// ─── Gather React components ───────────────────────────────────────────────

const reactNames = fs
  .readdirSync(REACT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !REACT_EXCLUDE.has(d.name))
  .map((d) => d.name)
  .concat(Object.keys(REACT_COLOCATED))
  .sort((a, b) => a.localeCompare(b));

// ─── Gather Web Components kebab names (for alias-aware lookups) ──────────

const wcKebabNames = fs
  .readdirSync(WC_DIR)
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.endsWith('.stories.ts'))
  .map((f) => f.replace(/\.ts$/, ''))
  .filter((n) => !WC_EXCLUDE_BASENAMES.has(n));

const rnReadme = readFile(RN_README);
const wcReadme = readFile(WC_README);

async function tryFetchManifest(baseUrl, label) {
  try {
    return await fetchManifest(baseUrl);
  } catch (err) {
    console.warn(
      `Could not fetch ${label} Storybook manifest (${err.message}) — no live demos for ${label}.`,
    );
    return null;
  }
}

const [reactManifest, wcManifest] = await Promise.all([
  tryFetchManifest('https://gnome-ui.org/react', 'React'),
  tryFetchManifest('https://gnome-ui.org/web-components', 'Web Components'),
]);

function buildReactPanel(name, reactManifest) {
  const dirName = REACT_COLOCATED[name]?.dir ?? name;
  const dir = path.join(REACT_DIR, dirName);
  // A co-located component (e.g. `Spacer` in `Toolbar/`) shares its parent's
  // README, which rarely has a fence of its own — the generic fallback below
  // covers that case rather than misattributing the parent's example.
  const readme = readFile(path.join(dir, 'README.md'));
  const fence = name === dirName ? firstFence(readme, ['tsx', 'jsx']) : null;
  const story = resolveStory(
    reactManifest,
    path.join(ROOT, 'packages/react'),
    path.join(dir, `${name}.stories.tsx`),
  );

  const code = fence ? fence.code : `import { ${name} } from '@gnome-ui/react';\n\n<${name} />`;

  let demo = '';
  let docsLink = '';
  let note = '';

  if (story) {
    demo = [
      '<div class="gnome-live-demo">',
      '  <div class="gnome-live-demo__bar">',
      '    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>',
      `    <div class="gnome-live-demo__url">gnome-ui.org/react — ${name}</div>`,
      '  </div>',
      `  <iframe src="https://gnome-ui.org/react/iframe.html?id=${story.storyId}&viewMode=story" title="${name} live demo (React)"></iframe>`,
      '</div>',
      '',
    ].join('\n');

    docsLink = story.docsId
      ? `[Full docs & controls →](https://gnome-ui.org/react/?path=/docs/${story.docsId})`
      : `[Full docs & controls →](https://gnome-ui.org/react/?path=/story/${story.storyId})`;
  } else {
    note = "Live demo unavailable — couldn't find a deployed Storybook story for this component.";
  }

  return { demo, code: { lang: 'tsx', code }, docsLink, note };
}

function buildRnPanel(name) {
  const section = headingSection(rnReadme, 3, name);
  const fence = firstFence(section, ['tsx', 'jsx']);
  const code = fence
    ? fence.code
    : `import { ${name} } from '@gnome-ui/react-native';\n\n<${name} />`;
  const anchor = name.toLowerCase();
  const note = section
    ? `No web-viewable Storybook for this platform — verified on a real iOS\nSimulator instead. See [the React Native package's own\nREADME](https://github.com/ElJijuna/gnome-ui/tree/main/packages/react-native#${anchor}).`
    : `No web-viewable Storybook for this platform — verified on a real iOS\nSimulator instead. See [the React Native package's own\nREADME](https://github.com/ElJijuna/gnome-ui/tree/main/packages/react-native).`;

  return { code: { lang: 'tsx', code }, note };
}

function buildWcPanel(name, kebab, wcManifest) {
  const titleCaseGuess = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  const section = headingSection(wcReadme, 2, titleCaseGuess);
  const fence = firstFence(section, ['html', 'js', 'ts']);
  const tag = `gnome-${kebab}`;
  const code = fence ? fence.code : `<${tag}></${tag}>`;
  const story = resolveStory(
    wcManifest,
    path.join(ROOT, 'packages/web-components'),
    path.join(WC_DIR, `${kebab}.stories.ts`),
  );

  let demo = '';
  let docsLink = '';
  let note = '';

  if (story) {
    demo = [
      '<div class="gnome-live-demo">',
      '  <div class="gnome-live-demo__bar">',
      '    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>',
      `    <div class="gnome-live-demo__url">gnome-ui.org/web-components — ${name}</div>`,
      '  </div>',
      `  <iframe src="https://gnome-ui.org/web-components/iframe.html?id=${story.storyId}&viewMode=story" title="${name} live demo (Web Components)"></iframe>`,
      '</div>',
      '',
    ].join('\n');

    docsLink = story.docsId
      ? `[Full docs & controls →](https://gnome-ui.org/web-components/?path=/docs/${story.docsId})`
      : `[Full docs & controls →](https://gnome-ui.org/web-components/?path=/story/${story.storyId})`;
  } else {
    note = "Live demo unavailable — couldn't find a deployed Storybook story for this component.";
  }

  return { demo, code: { lang: fence ? fence.lang : 'html', code }, docsLink, note };
}

// ─── Assemble ───────────────────────────────────────────────────────────────

const rows = [];

for (const name of reactNames) {
  const rnExists = fs.existsSync(path.join(RN_DIR, name));
  const wcKebab = toKebab(WC_NAME_ALIASES[name] ?? name);
  const wcExists = wcKebabNames.includes(wcKebab);

  rows.push({
    name,
    react: buildReactPanel(name, reactManifest),
    rn: rnExists ? buildRnPanel(name) : null,
    wc: wcExists ? buildWcPanel(name, wcKebab, wcManifest) : null,
  });
}

for (const { name, platforms } of NON_REACT_COMPONENTS) {
  rows.push({
    name,
    react: null,
    rn: platforms.includes('rn') ? buildRnPanel(name) : null,
    wc: platforms.includes('wc') ? buildWcPanel(name, toKebab(name), wcManifest) : null,
  });
}

rows.sort((a, b) => a.name.localeCompare(b.name));

const platformMeta = {
  react: { label: 'React', target: 'react' },
  rn: { label: 'React Native', target: 'react-native' },
  wc: { label: 'Web Components', target: 'web-components' },
};

function renderTabs(group, available) {
  const lines = ['<div class="gnome-platform-tabs">'];

  available.forEach((key, i) => {
    const { label, target } = platformMeta[key];
    const cls = ['gnome-platform-tab', 'gnome-platform-badge', `gnome-platform-badge--${target}`];

    if (i === 0) {
      cls.push('is-active');
    }

    lines.push(
      `  <button type="button" class="${cls.join(' ')}" data-group="${group}" data-target="${target}">${label}</button>`,
    );
  });

  lines.push('</div>');

  return lines.join('\n');
}

function renderPanel(group, key, panel, hidden) {
  const { target } = platformMeta[key];
  const attrs = `data-group="${group}" data-platform="${target}"`;
  const lines = [
    `<div markdown="1" class="gnome-platform-panel" ${attrs}${hidden ? ' hidden' : ''}>`,
    '',
  ];

  if (panel.demo) {
    lines.push(panel.demo);
  }

  lines.push('```' + panel.code.lang, panel.code.code, '```', '');

  if (panel.note) {
    lines.push(panel.note, '');
  }

  if (panel.docsLink) {
    lines.push(panel.docsLink, '');
  }

  lines.push('</div>');

  return lines.join('\n');
}

const sections = rows.map((row) => {
  const group = row.name.toLowerCase();
  const available = ['react', 'rn', 'wc'].filter((k) => row[k]);
  const out = [`## ${row.name}`, '', renderTabs(group, available), ''];

  available.forEach((key, i) => {
    out.push(renderPanel(group, key, row[key], i !== 0));
    out.push('');
  });

  return out.join('\n').replace(/\n+$/, '\n');
});

const intro = `# Component Gallery

Every component that ships on at least one platform, one live demo per
platform it's actually available on, switched by the tabs — React and Web
Components embed their **real, already-deployed Storybook story**; React
Native has no web-viewable Storybook (it's a mobile/Expo app, not a browser
target), so its tab shows only the usage snippet, verified on a real
Simulator instead. Code blocks are syntax-highlighted with the same
GNOME/Adwaita palette as the rest of this site.

This page is generated by \`scripts/generate-component-gallery.mjs\` from
each package's own README/story files — re-run it after shipping a new
component rather than hand-editing this file.
`;

fs.writeFileSync(OUT_FILE, intro + '\n' + sections.join('\n') + '\n');

console.log(`Generated ${rows.length} component sections in ${path.relative(ROOT, OUT_FILE)}.`);
console.log(
  `  React: ${rows.filter((r) => r.react).length}, React Native: ${rows.filter((r) => r.rn).length}, Web Components: ${rows.filter((r) => r.wc).length}`,
);

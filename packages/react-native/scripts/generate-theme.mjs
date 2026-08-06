import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'postcss';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(scriptDir, '..');
const outPath = resolve(pkgRoot, 'src/theme/tokens.generated.ts');

const tokensUrl = import.meta.resolve('@gnome-ui/core/styles');
const tokensPath = fileURLToPath(tokensUrl);
const css = await readFile(tokensPath, 'utf8');

const root = parse(css);

// ─── Extract the four theme variants' raw custom-property declarations ────
//
// Only the plain hex/rgb fallback values are read — the `@supports (color:
// oklch(...))` upgrade blocks are skipped entirely because React Native's
// color parser does not understand oklch(). Only top-level (unnested) rules
// are considered, so those @supports-wrapped duplicates are naturally
// excluded without special-casing them.

function declsOf(rule) {
  const decls = {};

  if (!rule) {
    return decls;
  }

  rule.walkDecls((decl) => {
    decls[decl.prop] = decl.value.replace(/\s+/g, ' ').trim();
  });

  return decls;
}

function findTopLevelRootRule() {
  return root.nodes.find((node) => node.type === 'rule' && node.selector === ':root');
}

function findTopLevelMediaRootRule(params) {
  const atRule = root.nodes.find(
    (node) => node.type === 'atrule' && node.name === 'media' && node.params === params,
  );

  if (!atRule) {
    throw new Error(`Expected top-level @media (${params}) block not found in tokens.css`);
  }

  return atRule.nodes.find((node) => node.type === 'rule' && node.selector === ':root');
}

const baseRaw = declsOf(findTopLevelRootRule());
const darkRaw = declsOf(findTopLevelMediaRootRule('(prefers-color-scheme: dark)'));
const highContrastRaw = declsOf(findTopLevelMediaRootRule('(prefers-contrast: more)'));
const highContrastDarkRaw = declsOf(
  findTopLevelMediaRootRule('(prefers-contrast: more) and (prefers-color-scheme: dark)'),
);

// ─── Resolve var() chains against a merged cascade context ────────────────
//
// Mirrors CSS cascade order: later objects in `merge(...)` win per-property,
// exactly like the source order of the @media blocks in tokens.css.

function merge(...maps) {
  return Object.assign({}, ...maps);
}

function resolveValue(value, context, seen = new Set()) {
  const varPattern = /var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/;
  let result = value;
  let match;
  let iterations = 0;

  while ((match = varPattern.exec(result))) {
    const [full, name, fallback] = match;

    if (seen.has(name)) {
      throw new Error(`Circular var() reference detected at ${name}`);
    }

    const referenced = context[name];
    const resolved =
      referenced !== undefined
        ? resolveValue(referenced, context, new Set(seen).add(name))
        : fallback;

    if (resolved === undefined) {
      throw new Error(`Unresolved var(${name}) — no fallback and no value in context`);
    }

    result = result.slice(0, match.index) + resolved + result.slice(match.index + full.length);

    if (++iterations > 20) {
      throw new Error(`Too many var() resolution passes for value: "${value}"`);
    }
  }

  return result;
}

function resolveAll(raw) {
  const resolved = {};

  for (const prop of Object.keys(raw)) {
    resolved[prop] = resolveValue(raw[prop], raw);
  }

  return resolved;
}

const variants = {
  light: resolveAll(baseRaw),
  dark: resolveAll(merge(baseRaw, darkRaw)),
  highContrast: resolveAll(merge(baseRaw, highContrastRaw)),
  highContrastDark: resolveAll(merge(baseRaw, darkRaw, highContrastRaw, highContrastDarkRaw)),
};

// ─── Convert resolved CSS strings to plain JS values usable in RN styles ──
//
// React Native has no CSS cascade, no `rem`/`px` units (dp is a bare
// number), and no oklch()/clamp()/box-shadow syntax. Values that don't map
// to a portable JS primitive are kept in the `raw` export (untouched
// resolved CSS string) instead of the typed object, so nothing is silently
// lost — just not auto-converted.

function camelCase(prop) {
  return prop.replace(/^--gnome-/, '').replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function toRNValue(prop, value) {
  if (prop === '--gnome-font-family' || prop === '--gnome-font-family-mono') {
    const match = value.match(/^"([^"]+)"/);

    return match ? match[1] : undefined;
  }

  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return value;
  }

  const modernRgb = value.match(/^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\/\s*([\d.]+)\s*\)$/);

  if (modernRgb) {
    const [, r, g, b, a] = modernRgb;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  if (/^rgba?\([\d.,\s]+\)$/.test(value)) {
    return value;
  }

  const px = value.match(/^(-?[\d.]+)px$/);

  if (px) {
    return Number(px[1]);
  }

  const rem = value.match(/^(-?[\d.]+)rem$/);

  if (rem) {
    // 1rem == 16 CSS px by convention; RN dp numbers follow the same scale.
    return Number(rem[1]) * 16;
  }

  const ms = value.match(/^(-?[\d.]+)ms$/);

  if (ms) {
    return Number(ms[1]);
  }

  const bezier = value.match(/^cubic-bezier\(([^)]+)\)$/);

  if (bezier) {
    return bezier[1].split(',').map((n) => Number(n.trim()));
  }

  if (/^-?[\d.]+$/.test(value)) {
    return Number(value);
  }

  return undefined;
}

const skippedByVariant = {};
const typedVariants = {};
const rawVariants = {};

for (const [variantName, resolved] of Object.entries(variants)) {
  const typed = {};
  const skipped = [];

  for (const prop of Object.keys(resolved).sort()) {
    const rnValue = toRNValue(prop, resolved[prop]);

    if (rnValue === undefined) {
      skipped.push(prop);
      continue;
    }

    typed[camelCase(prop)] = rnValue;
  }

  typedVariants[variantName] = typed;
  rawVariants[variantName] = Object.fromEntries(
    Object.keys(resolved)
      .sort()
      .map((prop) => [prop, resolved[prop]]),
  );
  skippedByVariant[variantName] = skipped;
}

console.log(
  `[theme:generate] ${skippedByVariant.light.length} token(s) per variant kept in ` +
    `\`raw\` only (not directly RN-portable): ${skippedByVariant.light.join(', ')}`,
);

// ─── Emit ──────────────────────────────────────────────────────────────────

function serialize(value) {
  return JSON.stringify(value, null, 2).replace(/^/gm, '  ').trimStart();
}

const variantNames = Object.keys(typedVariants);

// Every variant shares the same key set (each was merged over the full
// `baseRaw` map), so the *value* — not any single variant's literal type —
// determines the field type. Declaring `GnomeThemeTokens` explicitly and
// annotating each `export const` with it widens each field from its
// `as const` literal (e.g. `"#3584e4"`) to its general type (`string`), so
// the dark/high-contrast variants type-check as the same shape.
function tsTypeOf(value) {
  if (Array.isArray(value)) {
    return 'readonly number[]';
  }

  return typeof value;
}

const interfaceFields = Object.entries(typedVariants.light)
  .map(([key, value]) => `  readonly ${key}: ${tsTypeOf(value)};`)
  .join('\n');

const interfaceDecl = `export interface GnomeThemeTokens {\n${interfaceFields}\n}\n`;

const body = variantNames
  .map(
    (name) =>
      `export const ${name}Theme: GnomeThemeTokens = ${serialize(typedVariants[name])} as const;\n`,
  )
  .join('\n');

const rawBody = variantNames
  .map((name) => `export const ${name}RawTokens = ${serialize(rawVariants[name])} as const;\n`)
  .join('\n');

const header = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Run \`npm run theme:generate\` (from packages/react-native) to regenerate
 * from @gnome-ui/core's \`src/tokens.css\`.
 */

`;

await writeFile(outPath, header + interfaceDecl + '\n' + body + '\n' + rawBody, 'utf8');

console.log(`[theme:generate] wrote ${outPath}`);

#!/usr/bin/env node
// Builds @gnome-ui/charts, packs it with `npm pack`, installs the tarball into
// throwaway ESM and CommonJS consumers, and asserts the published package is
// actually importable/requireable the way a real consumer would use it.
//
// This exists because vite lib builds with preserveModules can silently let the
// `es` and `cjs` outputs overwrite each other when both formats resolve to the
// same file name — the resulting tarball type-checks and builds fine, but
// `import`/`require` fail (or silently load the wrong module format) once
// installed from the registry. `npm run build` alone does not catch that.

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const packageDir = resolve(__dirname, '..');

function findRepoRoot(startDir) {
  let dir = startDir;
  while (!existsSync(join(dir, 'turbo.json'))) {
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error('Could not locate repo root (turbo.json not found)');
    }
    dir = parent;
  }
  return dir;
}

const repoRoot = findRepoRoot(packageDir);

const failures = [];
let keepTmp = process.argv.includes('--keep');

function log(message) {
  process.stdout.write(`${message}\n`);
}

function step(name, fn) {
  log(`\n▶ ${name}`);
  try {
    fn();
    log(`  ok`);
  } catch (error) {
    failures.push({ name, error });
    log(`  FAILED: ${error.message}`);
  }
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: options.silent ? 'pipe' : 'inherit',
    ...options,
  });
}

function runCapture(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', ...options });
}

// 1. Build the package.
step('Build @gnome-ui/charts (turbo, with dependencies)', () => {
  run('npx', ['turbo', 'run', 'build', '--filter=@gnome-ui/charts'], { cwd: repoRoot });
});

const distDir = join(packageDir, 'dist');
if (!existsSync(distDir)) {
  throw new Error(`Expected build output at ${distDir}, but it does not exist.`);
}

// 2. Pack the tarball.
let tarballPath;
step('Pack tarball with npm pack', () => {
  const output = runCapture('npm', ['pack', '--json', '--pack-destination', packageDir], {
    cwd: packageDir,
  });
  const [{ filename }] = JSON.parse(output);
  tarballPath = join(packageDir, filename);
  if (!existsSync(tarballPath)) {
    throw new Error(`npm pack reported ${filename} but it was not found at ${tarballPath}`);
  }
  log(`  tarball: ${tarballPath}`);
});

// Resolve the exact versions of internal peer/dependency packages this
// monorepo currently ships, so the consumers install what @gnome-ui/charts
// was actually built against instead of an arbitrary registry range.
function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const reactPkgVersion = readJson(join(repoRoot, 'packages/react/package.json')).version;
const corePkgVersion = readJson(join(repoRoot, 'packages/core/package.json')).version;

const workDir = mkdtempSync(join(tmpdir(), 'gnome-ui-charts-verify-'));
log(`\nWorking directory: ${workDir}`);

function makeConsumer(kind, type) {
  const dir = join(workDir, kind);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    `${JSON.stringify({ name: `charts-consumer-${kind}`, private: true, version: '0.0.0', type }, null, 2)}\n`,
  );
  return dir;
}

const esmDir = makeConsumer('esm', 'module');
const cjsDir = makeConsumer('cjs', 'commonjs');

function installConsumer(dir) {
  run(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--ignore-scripts',
      '--no-save',
      tarballPath,
      `@gnome-ui/react@${reactPkgVersion}`,
      `@gnome-ui/core@${corePkgVersion}`,
      'react@^19',
      'react-dom@^19',
    ],
    { cwd: dir, silent: true },
  );
}

step('Install tarball into ESM consumer', () => installConsumer(esmDir));
step('Install tarball into CommonJS consumer', () => installConsumer(cjsDir));

const installedPkgDir = join(esmDir, 'node_modules', '@gnome-ui', 'charts');
const installedPkgJson = readJson(join(installedPkgDir, 'package.json'));

// 3-4. ESM checks: root import, named component imports, subpath import.
step('ESM: import package root and named exports', () => {
  const script = `
    const charts = await import('@gnome-ui/charts');
    if (typeof charts.SparkLineChart !== 'function') throw new Error('SparkLineChart missing from root import');
    if (typeof charts.SparkAreaChart !== 'function') throw new Error('SparkAreaChart missing from root import');
    if (typeof charts.LineChart !== 'function') throw new Error('LineChart missing from root import');
  `;
  writeFileSync(join(esmDir, 'check-root.mjs'), script);
  run('node', ['check-root.mjs'], { cwd: esmDir, silent: true });
});

step('ESM: import components by subpath', () => {
  const script = `
    const { SparkLineChart } = await import('@gnome-ui/charts/components/SparkLineChart');
    const { SparkAreaChart } = await import('@gnome-ui/charts/components/SparkAreaChart');
    if (typeof SparkLineChart !== 'function') throw new Error('SparkLineChart subpath import failed');
    if (typeof SparkAreaChart !== 'function') throw new Error('SparkAreaChart subpath import failed');
  `;
  writeFileSync(join(esmDir, 'check-subpath.mjs'), script);
  run('node', ['check-subpath.mjs'], { cwd: esmDir, silent: true });
});

// 5. CJS checks: same exports via require.
step('CJS: require package root and named exports', () => {
  const script = `
    const charts = require('@gnome-ui/charts');
    if (typeof charts.SparkLineChart !== 'function') throw new Error('SparkLineChart missing from root require');
    if (typeof charts.SparkAreaChart !== 'function') throw new Error('SparkAreaChart missing from root require');
    if (typeof charts.LineChart !== 'function') throw new Error('LineChart missing from root require');
  `;
  writeFileSync(join(cjsDir, 'check-root.cjs'), script);
  run('node', ['check-root.cjs'], { cwd: cjsDir, silent: true });
});

step('CJS: require components by subpath', () => {
  const script = `
    const { SparkLineChart } = require('@gnome-ui/charts/components/SparkLineChart');
    const { SparkAreaChart } = require('@gnome-ui/charts/components/SparkAreaChart');
    if (typeof SparkLineChart !== 'function') throw new Error('SparkLineChart subpath require failed');
    if (typeof SparkAreaChart !== 'function') throw new Error('SparkAreaChart subpath require failed');
  `;
  writeFileSync(join(cjsDir, 'check-subpath.cjs'), script);
  run('node', ['check-subpath.cjs'], { cwd: cjsDir, silent: true });
});

// 6. Walk package.json exports and confirm every import/require/types target exists.
step('Validate every exports target resolves to a real file', () => {
  const missing = [];
  const exportsMap = installedPkgJson.exports ?? {};
  for (const [subpath, target] of Object.entries(exportsMap)) {
    if (typeof target === 'string') {
      const filePath = join(installedPkgDir, target);
      if (!existsSync(filePath)) {
        missing.push(`${subpath} -> ${target}`);
      }
      continue;
    }
    for (const condition of ['types', 'import', 'require']) {
      const rel = target[condition];
      if (!rel) {
        continue;
      }
      const filePath = join(installedPkgDir, rel);
      if (!existsSync(filePath)) {
        missing.push(`${subpath} [${condition}] -> ${rel}`);
      }
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing exports targets:\n  ${missing.join('\n  ')}`);
  }
  log(`  checked ${Object.keys(exportsMap).length} export entries`);
});

// 7a. Confirm .js files contain no CommonJS artifacts (require/module.exports/exports.foo).
function walkFiles(dir, extension, visit) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, extension, visit);
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      visit(full);
    }
  }
}

step('Confirm .js files are real ESM (no CommonJS markers)', () => {
  const cjsMarkers = /(^|[^.\w])require\(|module\.exports\b|^\s*exports\.\w/m;
  const offenders = [];
  walkFiles(installedPkgDir, '.js', (full) => {
    const content = readFileSync(full, 'utf8');
    if (cjsMarkers.test(content)) {
      offenders.push(full);
    }
  });
  if (offenders.length > 0) {
    throw new Error(`.js files containing CommonJS syntax:\n  ${offenders.join('\n  ')}`);
  }
});

// 7b. Confirm every .cjs file is actually loadable via require().
step('Confirm .cjs files are loadable via require()', () => {
  const offenders = [];
  walkFiles(installedPkgDir, '.cjs', (full) => {
    try {
      runCapture('node', ['-e', `require(${JSON.stringify(full)})`], { cwd: cjsDir });
    } catch (error) {
      offenders.push(`${full}: ${error.message}`);
    }
  });
  if (offenders.length > 0) {
    throw new Error(`.cjs files that failed to load:\n  ${offenders.join('\n  ')}`);
  }
});

if (!keepTmp) {
  rmSync(workDir, { recursive: true, force: true });
  rmSync(tarballPath, { force: true });
} else {
  log(`\n--keep passed: leaving ${workDir} and ${tarballPath} in place`);
}

log('\n' + '='.repeat(60));
if (failures.length === 0) {
  log('All package verification checks passed.');
  process.exit(0);
} else {
  log(`${failures.length} check(s) failed:`);
  for (const { name, error } of failures) {
    log(`\n✗ ${name}\n  ${error.message}`);
  }
  process.exit(1);
}

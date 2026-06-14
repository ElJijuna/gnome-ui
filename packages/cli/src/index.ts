#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

import { Command } from 'commander';
import { NpmClient } from 'npmjs-api-client';

type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

type GnomeDependency = {
  name: string;
  section: DependencySection;
  spec: string;
  current: string;
  latest: string;
  status: 'latest' | 'outdated' | 'unknown';
};

type ProjectContext = {
  packageJson: PackageJson;
  packageJsonPath: string;
  projectRoot: string;
  lockVersions: Map<string, string>;
};

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const dependencySections: DependencySection[] = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

const colors = {
  bold: (value: string) => `\u001B[1m${value}\u001B[0m`,
  cyan: (value: string) => `\u001B[36m${value}\u001B[0m`,
  dim: (value: string) => `\u001B[2m${value}\u001B[0m`,
  green: (value: string) => `\u001B[32m${value}\u001B[0m`,
  red: (value: string) => `\u001B[31m${value}\u001B[0m`,
  yellow: (value: string) => `\u001B[33m${value}\u001B[0m`,
};

const program = new Command();
const npmClient = new NpmClient();

program.name('gnomeui').description('GNOME UI project utilities').version('1.0.0');

program
  .command('verify')
  .description('Compare installed @gnome-ui packages with the latest npm versions')
  .action(async () => {
    await handleVerify();
  });

program
  .command('update')
  .description('Update installed @gnome-ui packages to their latest npm versions')
  .action(async () => {
    await handleUpdate();
  });

try {
  await main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(colors.red(`\n${message}`));
  process.exitCode = 1;
}

async function main() {
  await program.parseAsync(process.argv);
}

async function handleVerify() {
  const context = await loadProjectContext(process.cwd());
  const dependencies = await getGnomeDependencies(context);
  const outdated = dependencies.filter((dependency) => dependency.status !== 'latest');

  printComparison(dependencies, context.packageJsonPath);

  if (outdated.length === 0) {
    printSummary(dependencies, []);

    return;
  }

  const shouldUpdate = await confirm('Actualizar ahora? SI o NO');

  if (!shouldUpdate) {
    console.log(colors.dim('No se realizaron cambios.'));
    printSummary(dependencies, []);

    return;
  }

  const updated = await updateDependencies(context, outdated);

  printSummary(dependencies, updated);
}

async function handleUpdate() {
  const context = await loadProjectContext(process.cwd());
  const dependencies = await getGnomeDependencies(context);
  const outdated = dependencies.filter((dependency) => dependency.status !== 'latest');

  printComparison(dependencies, context.packageJsonPath);

  if (outdated.length === 0) {
    printSummary(dependencies, []);

    return;
  }

  const updated = await updateDependencies(context, outdated);

  printSummary(dependencies, updated);
}

async function loadProjectContext(cwd: string): Promise<ProjectContext> {
  const packageJsonPath = findPackageJson(cwd);

  if (!packageJsonPath) {
    throw new Error('No se encontro un package.json desde el directorio actual.');
  }

  const projectRoot = dirname(packageJsonPath);
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as PackageJson;

  return {
    packageJson,
    packageJsonPath,
    projectRoot,
    lockVersions: await readPackageLockVersions(projectRoot),
  };
}

function findPackageJson(startPath: string) {
  let currentPath = startPath;
  const { root } = parse(startPath);

  while (true) {
    const candidate = join(currentPath, 'package.json');

    if (existsSync(candidate)) {
      return candidate;
    }

    if (currentPath === root) {
      return undefined;
    }

    currentPath = dirname(currentPath);
  }
}

async function readPackageLockVersions(projectRoot: string) {
  const lockPath = join(projectRoot, 'package-lock.json');
  const versions = new Map<string, string>();

  if (!existsSync(lockPath)) {
    return versions;
  }

  const lock = JSON.parse(await readFile(lockPath, 'utf8')) as {
    packages?: Record<string, { version?: string }>;
  };

  for (const [path, value] of Object.entries(lock.packages ?? {})) {
    if (!path.startsWith('node_modules/@gnome-ui/') || !value.version) {
      continue;
    }

    versions.set(path.replace('node_modules/', ''), value.version);
  }

  return versions;
}

async function getGnomeDependencies(context: ProjectContext) {
  const dependencies = dependencySections.flatMap((section) =>
    Object.entries(context.packageJson[section] ?? {})
      .filter(([name]) => name.startsWith('@gnome-ui/'))
      .map(([name, spec]) => ({ name, section, spec })),
  );

  const resolvedDependencies = await Promise.all(
    dependencies.map(async (dependency): Promise<GnomeDependency> => {
      const latest = await fetchLatestVersion(dependency.name);
      const current =
        context.lockVersions.get(dependency.name) ??
        extractVersion(dependency.spec) ??
        dependency.spec;

      return {
        ...dependency,
        current,
        latest,
        status: getStatus(current, latest),
      };
    }),
  );

  return resolvedDependencies.sort((left, right) => {
    const nameComparison = left.name.localeCompare(right.name);

    return nameComparison === 0 ? left.section.localeCompare(right.section) : nameComparison;
  });
}

async function fetchLatestVersion(packageName: string) {
  const manifest = await npmClient.package(packageName).latest();

  return manifest.version;
}

function getStatus(current: string, latest: string): GnomeDependency['status'] {
  const currentVersion = parseVersion(current);
  const latestVersion = parseVersion(latest);

  if (!currentVersion || !latestVersion) {
    return current === latest ? 'latest' : 'unknown';
  }

  return compareVersions(currentVersion, latestVersion) >= 0 ? 'latest' : 'outdated';
}

function printComparison(dependencies: GnomeDependency[], packageJsonPath: string) {
  console.log(colors.bold('\nGNOME UI dependencies'));
  console.log(colors.dim(packageJsonPath));

  if (dependencies.length === 0) {
    console.log(colors.yellow('\nNo se encontraron dependencias @gnome-ui/* en este proyecto.'));

    return;
  }

  console.table(
    dependencies.map((dependency) => ({
      Paquete: dependency.name,
      Seccion: dependency.section,
      Actual: dependency.current,
      Latest: dependency.latest,
      Estado:
        dependency.status === 'latest'
          ? '🔥 ultima'
          : dependency.status === 'outdated'
            ? 'actualizar'
            : 'revisar',
    })),
  );
}

async function updateDependencies(context: ProjectContext, dependencies: GnomeDependency[]) {
  for (const dependency of dependencies) {
    const section = context.packageJson[dependency.section];

    if (!section?.[dependency.name]) {
      continue;
    }

    section[dependency.name] = formatUpdatedRange(section[dependency.name], dependency.latest);
  }

  await writeFile(
    context.packageJsonPath,
    `${JSON.stringify(context.packageJson, null, 2)}\n`,
    'utf8',
  );

  const packageManager = detectPackageManager(context.projectRoot);

  await installDependencies(packageManager, context.projectRoot);

  return dependencies;
}

function detectPackageManager(projectRoot: string): PackageManager {
  if (existsSync(join(projectRoot, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  if (existsSync(join(projectRoot, 'yarn.lock'))) {
    return 'yarn';
  }

  if (existsSync(join(projectRoot, 'bun.lock')) || existsSync(join(projectRoot, 'bun.lockb'))) {
    return 'bun';
  }

  return 'npm';
}

function installDependencies(packageManager: PackageManager, projectRoot: string) {
  const commandByPackageManager: Record<PackageManager, string[]> = {
    npm: ['npm', 'install'],
    pnpm: ['pnpm', 'install'],
    yarn: ['yarn', 'install'],
    bun: ['bun', 'install'],
  };
  const [command, ...args] = commandByPackageManager[packageManager];

  console.log(colors.cyan(`\nEjecutando ${command} ${args.join(' ')}...\n`));

  return new Promise<void>((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: projectRoot,
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    childProcess.on('error', reject);
    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();

        return;
      }

      reject(new Error(`${command} ${args.join(' ')} termino con codigo ${code}.`));
    });
  });
}

async function confirm(question: string) {
  if (!input.isTTY) {
    console.log(
      colors.yellow(
        'No se detecto una terminal interactiva. Ejecuta gnomeui update para actualizar automaticamente.',
      ),
    );

    return false;
  }

  const readline = createInterface({ input, output });

  try {
    const answer = await readline.question(`${question} `);

    return ['si', 'sí', 's', 'yes', 'y'].includes(answer.trim().toLowerCase());
  } finally {
    readline.close();
  }
}

function printSummary(dependencies: GnomeDependency[], updated: GnomeDependency[]) {
  const pending =
    dependencies.filter((dependency) => dependency.status !== 'latest').length - updated.length;

  console.log(colors.bold('\nSummary'));
  console.log(`Total @gnome-ui: ${dependencies.length}`);
  console.log(
    `Al dia: ${dependencies.filter((dependency) => dependency.status === 'latest').length}`,
  );
  console.log(`Actualizadas: ${updated.length}`);
  console.log(`Pendientes: ${Math.max(pending, 0)}`);
}

function formatUpdatedRange(currentRange: string, latest: string) {
  const prefix = currentRange.match(/^[~^]/)?.[0] ?? '';

  return `${prefix}${latest}`;
}

function extractVersion(versionRange: string) {
  return versionRange.match(/\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/)?.[0];
}

function parseVersion(version: string) {
  const match = extractVersion(version)?.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/);

  if (!match) {
    return undefined;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? '',
  };
}

function compareVersions(
  left: NonNullable<ReturnType<typeof parseVersion>>,
  right: NonNullable<ReturnType<typeof parseVersion>>,
) {
  for (const key of ['major', 'minor', 'patch'] as const) {
    const difference = left[key] - right[key];

    if (difference !== 0) {
      return difference;
    }
  }

  if (left.prerelease === right.prerelease) {
    return 0;
  }

  if (!left.prerelease) {
    return 1;
  }

  if (!right.prerelease) {
    return -1;
  }

  return left.prerelease.localeCompare(right.prerelease);
}

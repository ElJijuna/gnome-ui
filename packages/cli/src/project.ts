import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';

export type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

export const DEPENDENCY_SECTIONS: readonly DependencySection[] = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

export interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface ProjectContext {
  packageJson: PackageJson;
  packageJsonPath: string;
  projectRoot: string;
  lockVersions: Map<string, string>;
}

/** Walks up from `startPath` to find the nearest `package.json`. */
export function findPackageJson(startPath: string): string | undefined {
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

/**
 * Reads installed `@gnome-ui/*` versions from `package-lock.json`.
 *
 * Returns an empty map for pnpm/yarn/bun projects — those lockfiles use
 * different formats this doesn't parse, so callers fall back to the version
 * range declared in `package.json`.
 */
export async function readPackageLockVersions(projectRoot: string): Promise<Map<string, string>> {
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

/** Loads the nearest `package.json` and its lockfile-resolved versions. */
export async function loadProjectContext(cwd: string): Promise<ProjectContext> {
  const packageJsonPath = findPackageJson(cwd);

  if (!packageJsonPath) {
    throw new Error('Could not find a package.json from the current directory.');
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

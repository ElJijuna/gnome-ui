import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { GnomeDependency } from './dependencies.js';
import type { ProjectContext } from './project.js';
import { formatUpdatedRange } from './version.js';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const INSTALL_COMMAND: Record<PackageManager, readonly [string, ...string[]]> = {
  npm: ['npm', 'install'],
  pnpm: ['pnpm', 'install'],
  yarn: ['yarn', 'install'],
  bun: ['bun', 'install'],
};

/** Detects the package manager from lockfiles present in `projectRoot`. */
export function detectPackageManager(projectRoot: string): PackageManager {
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

/** Runs the detected package manager's install command, inheriting stdio. */
export function installDependencies(
  packageManager: PackageManager,
  projectRoot: string,
): Promise<void> {
  const [command, ...args] = INSTALL_COMMAND[packageManager];

  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();

        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}.`));
    });
  });
}

/**
 * Writes the selected dependencies' updated ranges to `package.json` and
 * runs the project's package manager install command.
 *
 * Shared by both the `verify` and `update` commands — the only difference
 * between them is what happens before this is called (a confirmation
 * prompt for `verify`, none for `update`).
 */
export async function applyUpdates(
  context: ProjectContext,
  dependencies: readonly GnomeDependency[],
): Promise<GnomeDependency[]> {
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

  return [...dependencies];
}

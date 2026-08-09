import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { findPackageJson, loadProjectContext, readPackageLockVersions } from './project.js';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'gnomeui-cli-project-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('findPackageJson', () => {
  it('finds package.json in the starting directory', async () => {
    await writeFile(join(root, 'package.json'), '{}', 'utf8');

    expect(findPackageJson(root)).toBe(join(root, 'package.json'));
  });

  it('finds package.json by walking up parent directories', async () => {
    await writeFile(join(root, 'package.json'), '{}', 'utf8');
    const nested = join(root, 'a', 'b', 'c');
    await mkdir(nested, { recursive: true });

    expect(findPackageJson(nested)).toBe(join(root, 'package.json'));
  });

  it('returns undefined when no package.json exists up to the filesystem root', async () => {
    const nested = join(root, 'a', 'b');
    await mkdir(nested, { recursive: true });

    expect(findPackageJson(nested)).toBeUndefined();
  });
});

describe('readPackageLockVersions', () => {
  it('returns an empty map when there is no lockfile', async () => {
    const versions = await readPackageLockVersions(root);

    expect(versions.size).toBe(0);
  });

  it('maps installed @gnome-ui/* versions from package-lock.json', async () => {
    await writeFile(
      join(root, 'package-lock.json'),
      JSON.stringify({
        packages: {
          '': { name: 'app' },
          'node_modules/@gnome-ui/react': { version: '1.42.0' },
          'node_modules/@gnome-ui/hooks': { version: '1.10.0' },
          'node_modules/left-pad': { version: '1.0.0' },
        },
      }),
      'utf8',
    );

    const versions = await readPackageLockVersions(root);

    expect(versions.get('@gnome-ui/react')).toBe('1.42.0');
    expect(versions.get('@gnome-ui/hooks')).toBe('1.10.0');
    expect(versions.has('left-pad')).toBe(false);
    expect(versions.size).toBe(2);
  });

  it('ignores packages entries without a version', async () => {
    await writeFile(
      join(root, 'package-lock.json'),
      JSON.stringify({ packages: { 'node_modules/@gnome-ui/react': {} } }),
      'utf8',
    );

    const versions = await readPackageLockVersions(root);

    expect(versions.size).toBe(0);
  });
});

describe('loadProjectContext', () => {
  it('loads package.json and lockfile versions from the nearest project', async () => {
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ dependencies: { '@gnome-ui/react': '^1.40.0' } }),
      'utf8',
    );
    await writeFile(
      join(root, 'package-lock.json'),
      JSON.stringify({ packages: { 'node_modules/@gnome-ui/react': { version: '1.41.0' } } }),
      'utf8',
    );

    const context = await loadProjectContext(root);

    expect(context.packageJsonPath).toBe(join(root, 'package.json'));
    expect(context.projectRoot).toBe(root);
    expect(context.packageJson.dependencies).toEqual({ '@gnome-ui/react': '^1.40.0' });
    expect(context.lockVersions.get('@gnome-ui/react')).toBe('1.41.0');
  });

  it('throws when no package.json can be found', async () => {
    const nested = join(root, 'a', 'b');
    await mkdir(nested, { recursive: true });

    await expect(loadProjectContext(nested)).rejects.toThrow(
      'Could not find a package.json from the current directory.',
    );
  });
});

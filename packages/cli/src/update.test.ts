import { EventEmitter } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GnomeDependency } from './dependencies.js';
import type { ProjectContext } from './project.js';

const spawnMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));

const { applyUpdates, detectPackageManager, installDependencies } = await import('./update.js');

class FakeChildProcess extends EventEmitter {}

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'gnomeui-cli-update-'));
  spawnMock.mockReset();
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('detectPackageManager', () => {
  it('defaults to npm when no lockfile is present', () => {
    expect(detectPackageManager(root)).toBe('npm');
  });

  it('detects pnpm from pnpm-lock.yaml', async () => {
    await writeFile(join(root, 'pnpm-lock.yaml'), '', 'utf8');

    expect(detectPackageManager(root)).toBe('pnpm');
  });

  it('detects yarn from yarn.lock', async () => {
    await writeFile(join(root, 'yarn.lock'), '', 'utf8');

    expect(detectPackageManager(root)).toBe('yarn');
  });

  it('detects bun from bun.lock', async () => {
    await writeFile(join(root, 'bun.lock'), '', 'utf8');

    expect(detectPackageManager(root)).toBe('bun');
  });

  it('detects bun from bun.lockb', async () => {
    await writeFile(join(root, 'bun.lockb'), '', 'utf8');

    expect(detectPackageManager(root)).toBe('bun');
  });
});

describe('installDependencies', () => {
  it('spawns the right command for each package manager', async () => {
    const child = new FakeChildProcess();

    spawnMock.mockReturnValue(child);

    const promise = installDependencies('pnpm', root);

    expect(spawnMock).toHaveBeenCalledWith(
      'pnpm',
      ['install'],
      expect.objectContaining({ cwd: root, stdio: 'inherit' }),
    );

    child.emit('exit', 0);
    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects when the install command exits non-zero', async () => {
    const child = new FakeChildProcess();

    spawnMock.mockReturnValue(child);

    const promise = installDependencies('npm', root);

    child.emit('exit', 1);
    await expect(promise).rejects.toThrow('npm install exited with code 1.');
  });

  it('rejects when the child process errors', async () => {
    const child = new FakeChildProcess();

    spawnMock.mockReturnValue(child);

    const promise = installDependencies('npm', root);
    const failure = new Error('spawn npm ENOENT');

    child.emit('error', failure);
    await expect(promise).rejects.toBe(failure);
  });
});

describe('applyUpdates', () => {
  function makeDependency(overrides: Partial<GnomeDependency> = {}): GnomeDependency {
    return {
      name: '@gnome-ui/react',
      section: 'dependencies',
      spec: '^1.40.0',
      current: '1.40.0',
      latest: '1.44.0',
      status: 'outdated',
      ...overrides,
    };
  }

  it('writes updated ranges to package.json and runs install', async () => {
    const packageJsonPath = join(root, 'package.json');

    await writeFile(
      packageJsonPath,
      JSON.stringify({ dependencies: { '@gnome-ui/react': '^1.40.0' } }),
      'utf8',
    );

    const context: ProjectContext = {
      packageJson: { dependencies: { '@gnome-ui/react': '^1.40.0' } },
      packageJsonPath,
      projectRoot: root,
      lockVersions: new Map(),
    };

    const child = new FakeChildProcess();

    spawnMock.mockReturnValue(child);

    const promise = applyUpdates(context, [makeDependency()]);

    await vi.waitFor(() => expect(spawnMock).toHaveBeenCalled());
    child.emit('exit', 0);
    const updated = await promise;

    expect(updated).toEqual([makeDependency()]);

    const written = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    expect(written.dependencies['@gnome-ui/react']).toBe('^1.44.0');
  });

  it('skips a dependency no longer declared in its recorded section', async () => {
    const packageJsonPath = join(root, 'package.json');

    await writeFile(packageJsonPath, JSON.stringify({ dependencies: {} }), 'utf8');

    const context: ProjectContext = {
      packageJson: { dependencies: {} },
      packageJsonPath,
      projectRoot: root,
      lockVersions: new Map(),
    };

    const child = new FakeChildProcess();

    spawnMock.mockReturnValue(child);

    const promise = applyUpdates(context, [makeDependency()]);

    await vi.waitFor(() => expect(spawnMock).toHaveBeenCalled());
    child.emit('exit', 0);
    await promise;

    const written = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    expect(written.dependencies).toEqual({});
  });
});

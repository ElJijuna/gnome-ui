import { describe, expect, it, vi } from 'vitest';

import { getGnomeDependencies, type LatestVersionFetcher } from './dependencies.js';
import type { ProjectContext } from './project.js';

function makeContext(
  packageJson: ProjectContext['packageJson'],
  lockVersions: Record<string, string> = {},
): ProjectContext {
  return {
    packageJson,
    packageJsonPath: '/app/package.json',
    projectRoot: '/app',
    lockVersions: new Map(Object.entries(lockVersions)),
  };
}

describe('getGnomeDependencies', () => {
  it('returns an empty array when there are no @gnome-ui/* dependencies', async () => {
    const context = makeContext({ dependencies: { react: '^19.0.0' } });
    const fetchLatestVersion: LatestVersionFetcher = vi.fn();

    const dependencies = await getGnomeDependencies(context, fetchLatestVersion);

    expect(dependencies).toEqual([]);
    expect(fetchLatestVersion).not.toHaveBeenCalled();
  });

  it('only collects dependencies whose name starts with @gnome-ui/', async () => {
    const context = makeContext({
      dependencies: { '@gnome-ui/react': '^1.0.0', react: '^19.0.0' },
    });
    const fetchLatestVersion: LatestVersionFetcher = vi.fn().mockResolvedValue('1.0.0');

    const dependencies = await getGnomeDependencies(context, fetchLatestVersion);

    expect(dependencies).toHaveLength(1);
    expect(dependencies[0].name).toBe('@gnome-ui/react');
  });

  it('scans all four dependency sections', async () => {
    const context = makeContext({
      dependencies: { '@gnome-ui/react': '^1.0.0' },
      devDependencies: { '@gnome-ui/cli': '^1.0.0' },
      optionalDependencies: { '@gnome-ui/charts': '^1.0.0' },
      peerDependencies: { '@gnome-ui/hooks': '^1.0.0' },
    });
    const fetchLatestVersion: LatestVersionFetcher = vi.fn().mockResolvedValue('1.0.0');

    const dependencies = await getGnomeDependencies(context, fetchLatestVersion);

    expect(dependencies.map((dependency) => dependency.section).sort()).toEqual([
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ]);
  });

  it('prefers the lockfile-resolved version over the declared range', async () => {
    const context = makeContext(
      { dependencies: { '@gnome-ui/react': '^1.40.0' } },
      { '@gnome-ui/react': '1.43.2' },
    );
    const fetchLatestVersion: LatestVersionFetcher = vi.fn().mockResolvedValue('1.43.2');

    const [dependency] = await getGnomeDependencies(context, fetchLatestVersion);

    expect(dependency.current).toBe('1.43.2');
  });

  it('falls back to the declared range when no lockfile version is known', async () => {
    const context = makeContext({ dependencies: { '@gnome-ui/react': '^1.40.0' } });
    const fetchLatestVersion: LatestVersionFetcher = vi.fn().mockResolvedValue('1.40.0');

    const [dependency] = await getGnomeDependencies(context, fetchLatestVersion);

    expect(dependency.current).toBe('1.40.0');
  });

  it('marks a dependency outdated when current is behind latest', async () => {
    const context = makeContext(
      { dependencies: { '@gnome-ui/react': '^1.40.0' } },
      { '@gnome-ui/react': '1.40.0' },
    );
    const fetchLatestVersion: LatestVersionFetcher = vi.fn().mockResolvedValue('1.44.0');

    const [dependency] = await getGnomeDependencies(context, fetchLatestVersion);

    expect(dependency.status).toBe('outdated');
    expect(dependency.latest).toBe('1.44.0');
  });

  it('sorts by package name then section', async () => {
    const context = makeContext({
      dependencies: { '@gnome-ui/react': '^1.0.0' },
      devDependencies: { '@gnome-ui/react': '^1.0.0', '@gnome-ui/cli': '^1.0.0' },
    });
    const fetchLatestVersion: LatestVersionFetcher = vi.fn().mockResolvedValue('1.0.0');

    const dependencies = await getGnomeDependencies(context, fetchLatestVersion);

    expect(dependencies.map((dependency) => `${dependency.name}:${dependency.section}`)).toEqual([
      '@gnome-ui/cli:devDependencies',
      '@gnome-ui/react:dependencies',
      '@gnome-ui/react:devDependencies',
    ]);
  });

  it('calls fetchLatestVersion once per declared dependency', async () => {
    const context = makeContext({
      dependencies: { '@gnome-ui/react': '^1.0.0' },
      devDependencies: { '@gnome-ui/cli': '^1.0.0' },
    });
    const fetchLatestVersion: LatestVersionFetcher = vi.fn().mockResolvedValue('1.0.0');

    await getGnomeDependencies(context, fetchLatestVersion);

    expect(fetchLatestVersion).toHaveBeenCalledTimes(2);
    expect(fetchLatestVersion).toHaveBeenCalledWith('@gnome-ui/react');
    expect(fetchLatestVersion).toHaveBeenCalledWith('@gnome-ui/cli');
  });
});

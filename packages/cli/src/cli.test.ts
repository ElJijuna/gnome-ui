import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GnomeDependency } from './dependencies.js';
import type { ProjectContext } from './project.js';

const getGnomeDependencies = vi.fn();
const createNpmLatestVersionFetcher = vi.fn(() => vi.fn());
const loadProjectContext = vi.fn();
const applyUpdates = vi.fn();

vi.mock('./dependencies.js', () => ({
  getGnomeDependencies: (...args: unknown[]) => getGnomeDependencies(...args),
  createNpmLatestVersionFetcher: () => createNpmLatestVersionFetcher(),
}));

vi.mock('./project.js', () => ({
  loadProjectContext: (...args: unknown[]) => loadProjectContext(...args),
}));

vi.mock('./update.js', () => ({
  applyUpdates: (...args: unknown[]) => applyUpdates(...args),
}));

const { runStatus, runUpdate, runVerify } = await import('./cli.js');

const context: ProjectContext = {
  packageJson: {},
  packageJsonPath: '/app/package.json',
  projectRoot: '/app',
  lockVersions: new Map(),
};

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

let originalStdinIsTty: boolean | undefined;
let originalStdoutIsTty: boolean | undefined;
let logSpy: ReturnType<typeof vi.spyOn>;
let tableSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  originalStdinIsTty = process.stdin.isTTY;
  originalStdoutIsTty = process.stdout.isTTY;
  Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });
  Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });

  loadProjectContext.mockResolvedValue(context);
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  tableSpy = vi.spyOn(console, 'table').mockImplementation(() => {});
});

afterEach(() => {
  Object.defineProperty(process.stdin, 'isTTY', {
    value: originalStdinIsTty,
    configurable: true,
  });
  Object.defineProperty(process.stdout, 'isTTY', {
    value: originalStdoutIsTty,
    configurable: true,
  });
  vi.restoreAllMocks();
});

describe('non-interactive verify', () => {
  it('prints the comparison and does not update when everything is current', async () => {
    getGnomeDependencies.mockResolvedValue([makeDependency({ status: 'latest' })]);

    await runVerify();

    expect(applyUpdates).not.toHaveBeenCalled();
    expect(tableSpy).toHaveBeenCalled();
  });

  it('reports outdated packages but does not update without a TTY', async () => {
    getGnomeDependencies.mockResolvedValue([makeDependency()]);

    await runVerify();

    expect(applyUpdates).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('No interactive terminal detected'),
    );
  });
});

describe('non-interactive status', () => {
  it('prints the comparison table and never touches applyUpdates', async () => {
    getGnomeDependencies.mockResolvedValue([makeDependency()]);

    await runStatus();

    expect(tableSpy).toHaveBeenCalled();
    expect(applyUpdates).not.toHaveBeenCalled();
  });

  it('prints a "no dependencies" message when there are none', async () => {
    getGnomeDependencies.mockResolvedValue([]);

    await runStatus();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No @gnome-ui dependencies found'));
    expect(tableSpy).not.toHaveBeenCalled();
  });

  it('does not print the "run gnomeui update" hint that verify shows', async () => {
    getGnomeDependencies.mockResolvedValue([makeDependency()]);

    await runStatus();

    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('No interactive terminal detected'),
    );
  });
});

describe('non-interactive update', () => {
  it('does nothing when there are no @gnome-ui dependencies', async () => {
    getGnomeDependencies.mockResolvedValue([]);

    await runUpdate();

    expect(applyUpdates).not.toHaveBeenCalled();
  });

  it('does nothing when everything is already up to date', async () => {
    getGnomeDependencies.mockResolvedValue([makeDependency({ status: 'latest' })]);

    await runUpdate();

    expect(applyUpdates).not.toHaveBeenCalled();
  });

  it('applies updates to every outdated dependency automatically', async () => {
    const outdated = makeDependency();

    getGnomeDependencies.mockResolvedValue([outdated]);
    applyUpdates.mockResolvedValue([outdated]);

    await runUpdate();

    expect(applyUpdates).toHaveBeenCalledWith(context, [outdated]);
  });
});

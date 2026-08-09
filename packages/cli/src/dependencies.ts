import { NpmClient } from 'npmjs-api-client';

import { DEPENDENCY_SECTIONS, type DependencySection, type ProjectContext } from './project.js';
import { type DependencyStatus, extractVersion, getStatus } from './version.js';

export interface GnomeDependency {
  name: string;
  section: DependencySection;
  spec: string;
  current: string;
  latest: string;
  status: DependencyStatus;
}

/** Resolves the latest published version of an npm package. */
export type LatestVersionFetcher = (packageName: string) => Promise<string>;

/** Creates a {@link LatestVersionFetcher} backed by the real npm registry. */
export function createNpmLatestVersionFetcher(): LatestVersionFetcher {
  const npmClient = new NpmClient();

  return async (packageName) => {
    const manifest = await npmClient.package(packageName).latest();

    return manifest.version;
  };
}

/**
 * Collects every `@gnome-ui/*` dependency declared in `context.packageJson`,
 * resolves each one's installed and latest npm version, and sorts the
 * result by package name then section.
 */
export async function getGnomeDependencies(
  context: ProjectContext,
  fetchLatestVersion: LatestVersionFetcher,
): Promise<GnomeDependency[]> {
  const declarations = DEPENDENCY_SECTIONS.flatMap((section) =>
    Object.entries(context.packageJson[section] ?? {})
      .filter(([name]) => name.startsWith('@gnome-ui/'))
      .map(([name, spec]) => ({ name, section, spec })),
  );

  const dependencies = await Promise.all(
    declarations.map(async (declaration): Promise<GnomeDependency> => {
      const latest = await fetchLatestVersion(declaration.name);
      const current =
        context.lockVersions.get(declaration.name) ??
        extractVersion(declaration.spec) ??
        declaration.spec;

      return {
        ...declaration,
        current,
        latest,
        status: getStatus(current, latest),
      };
    }),
  );

  return dependencies.sort((left, right) => {
    const nameComparison = left.name.localeCompare(right.name);

    return nameComparison === 0 ? left.section.localeCompare(right.section) : nameComparison;
  });
}

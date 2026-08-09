export type DependencyStatus = 'latest' | 'outdated' | 'unknown';

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
}

const SEMVER_PATTERN = /\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/;
const SEMVER_PARTS_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/;

/** Extracts the first semver-shaped substring from a version range or spec. */
export function extractVersion(versionRange: string): string | undefined {
  return versionRange.match(SEMVER_PATTERN)?.[0];
}

/** Parses a version string into comparable numeric parts. */
export function parseVersion(version: string): ParsedVersion | undefined {
  const match = extractVersion(version)?.match(SEMVER_PARTS_PATTERN);

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

/**
 * Compares two parsed versions. Returns a positive number when `left` is
 * newer, negative when `right` is newer, and `0` when equal. A version with
 * no prerelease outranks the same version with one, matching semver
 * precedence rules.
 */
export function compareVersions(left: ParsedVersion, right: ParsedVersion): number {
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

/** Determines whether `current` is at, behind, or incomparable to `latest`. */
export function getStatus(current: string, latest: string): DependencyStatus {
  const currentVersion = parseVersion(current);
  const latestVersion = parseVersion(latest);

  if (!currentVersion || !latestVersion) {
    return current === latest ? 'latest' : 'unknown';
  }

  return compareVersions(currentVersion, latestVersion) >= 0 ? 'latest' : 'outdated';
}

/** Applies `latest` to a version range, preserving its `^`/`~` prefix. */
export function formatUpdatedRange(currentRange: string, latest: string): string {
  const prefix = currentRange.match(/^[~^]/)?.[0] ?? '';

  return `${prefix}${latest}`;
}

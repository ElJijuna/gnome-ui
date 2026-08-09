import { describe, expect, it } from 'vitest';

import {
  compareVersions,
  extractVersion,
  formatUpdatedRange,
  getStatus,
  parseVersion,
} from './version.js';

describe('extractVersion', () => {
  it('extracts a bare semver', () => {
    expect(extractVersion('1.2.3')).toBe('1.2.3');
  });

  it('extracts a semver from a caret range', () => {
    expect(extractVersion('^1.2.3')).toBe('1.2.3');
  });

  it('extracts a semver from a tilde range', () => {
    expect(extractVersion('~1.2.3')).toBe('1.2.3');
  });

  it('extracts a semver with a prerelease tag', () => {
    expect(extractVersion('1.2.3-beta.1')).toBe('1.2.3-beta.1');
  });

  it('returns undefined for a non-semver string', () => {
    expect(extractVersion('workspace:*')).toBeUndefined();
  });
});

describe('parseVersion', () => {
  it('parses major, minor, and patch', () => {
    expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: '' });
  });

  it('parses a prerelease tag', () => {
    expect(parseVersion('1.2.3-beta.1')).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: 'beta.1',
    });
  });

  it('parses a version embedded in a range', () => {
    expect(parseVersion('^1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: '' });
  });

  it('returns undefined for an unparseable string', () => {
    expect(parseVersion('workspace:*')).toBeUndefined();
  });
});

describe('compareVersions', () => {
  const v = (version: string) => parseVersion(version)!;

  it('returns 0 for equal versions', () => {
    expect(compareVersions(v('1.2.3'), v('1.2.3'))).toBe(0);
  });

  it('returns positive when left has a newer major', () => {
    expect(compareVersions(v('2.0.0'), v('1.9.9'))).toBeGreaterThan(0);
  });

  it('returns negative when left has an older major', () => {
    expect(compareVersions(v('1.0.0'), v('2.0.0'))).toBeLessThan(0);
  });

  it('returns positive when left has a newer minor with equal major', () => {
    expect(compareVersions(v('1.3.0'), v('1.2.9'))).toBeGreaterThan(0);
  });

  it('returns positive when left has a newer patch with equal major/minor', () => {
    expect(compareVersions(v('1.2.4'), v('1.2.3'))).toBeGreaterThan(0);
  });

  it('ranks no prerelease above a prerelease of the same version', () => {
    expect(compareVersions(v('1.2.3'), v('1.2.3-beta.1'))).toBeGreaterThan(0);
  });

  it('ranks a prerelease below no prerelease of the same version', () => {
    expect(compareVersions(v('1.2.3-beta.1'), v('1.2.3'))).toBeLessThan(0);
  });

  it('compares two prereleases lexicographically', () => {
    expect(compareVersions(v('1.2.3-beta.2'), v('1.2.3-beta.1'))).toBeGreaterThan(0);
  });
});

describe('getStatus', () => {
  it('returns latest when current equals latest', () => {
    expect(getStatus('1.2.3', '1.2.3')).toBe('latest');
  });

  it('returns latest when current is newer than latest', () => {
    expect(getStatus('1.3.0', '1.2.3')).toBe('latest');
  });

  it('returns outdated when current is older than latest', () => {
    expect(getStatus('1.2.0', '1.3.0')).toBe('outdated');
  });

  it('returns unknown when neither side parses and they differ', () => {
    expect(getStatus('workspace:*', '1.0.0')).toBe('unknown');
  });

  it('returns latest when neither side parses but they are equal strings', () => {
    expect(getStatus('workspace:*', 'workspace:*')).toBe('latest');
  });
});

describe('formatUpdatedRange', () => {
  it('preserves a caret prefix', () => {
    expect(formatUpdatedRange('^1.2.3', '1.4.0')).toBe('^1.4.0');
  });

  it('preserves a tilde prefix', () => {
    expect(formatUpdatedRange('~1.2.3', '1.4.0')).toBe('~1.4.0');
  });

  it('adds no prefix for an exact range', () => {
    expect(formatUpdatedRange('1.2.3', '1.4.0')).toBe('1.4.0');
  });
});

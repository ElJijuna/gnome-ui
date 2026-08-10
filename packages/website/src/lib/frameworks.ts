import { components } from '@/generated/registry';
import type { FrameworkId, VisualPackageId } from '@/types/registry';

/** Display order for the availability matrix, everywhere it's rendered. */
export const FRAMEWORKS: FrameworkId[] = ['react', 'web-components', 'react-native', 'angular'];

/** `react`, `layout`, and `charts` are all sub-libraries of the same "react" framework target. */
export function frameworkOf(pkg: VisualPackageId): Exclude<FrameworkId, 'angular'> {
  if (pkg === 'web-components' || pkg === 'react-native') {
    return pkg;
  }

  return 'react';
}

/**
 * Canonical component name -> the set of frameworks that ship it, computed
 * once from the generated registry. `angular` is never a member — no
 * package implements it yet.
 */
export const AVAILABILITY_BY_NAME: Map<string, Set<FrameworkId>> = components.reduce(
  (map, entry) => {
    const set = map.get(entry.name) ?? new Set<FrameworkId>();

    set.add(frameworkOf(entry.package));
    map.set(entry.name, set);

    return map;
  },
  new Map<string, Set<FrameworkId>>(),
);

/** Which frameworks implement a component of this name, `angular` always excluded (not yet available). */
export function availabilityFor(name: string): Set<FrameworkId> {
  return AVAILABILITY_BY_NAME.get(name) ?? new Set();
}

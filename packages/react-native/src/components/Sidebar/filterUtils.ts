import { Children, isValidElement, type ReactNode } from 'react';

/** Recursively count items whose `label` prop matches `filter` (case-insensitive). */
export function countMatchingItems(children: ReactNode, filter: string): number {
  let count = 0;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    const props = child.props as Record<string, unknown>;

    if (typeof props.label === 'string') {
      if (props.label.toLowerCase().includes(filter.toLowerCase())) {
        count++;
      }
    } else if (props.children) {
      count += countMatchingItems(props.children as ReactNode, filter);
    }
  });

  return count;
}

/**
 * Whether a single top-level `Sidebar` child would render something under
 * `filter` — a bare `SidebarItem` if its own `label` matches, a
 * `SidebarSection` (or anything else with `children`) if any descendant
 * matches. Used to decide which children get a `Separator` between them, so
 * a filtered-out (null-rendering) item doesn't still claim a divider slot.
 */
export function isChildVisible(child: ReactNode, filter: string): boolean {
  if (!filter) {
    return true;
  }

  if (!isValidElement(child)) {
    return true;
  }

  const props = child.props as Record<string, unknown>;

  if (typeof props.label === 'string') {
    return props.label.toLowerCase().includes(filter.toLowerCase());
  }

  if (props.children) {
    return countMatchingItems(props.children as ReactNode, filter) > 0;
  }

  return true;
}

import { type HTMLAttributes, type KeyboardEvent, type ReactNode, useRef } from 'react';

import styles from './ViewSwitcher.module.css';

export interface ViewSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Accessible label for the group. */
  'aria-label'?: string;
}

/**
 * Segmented control for switching between major views.
 *
 * Mirrors the Adwaita `AdwViewSwitcher` pattern. Place in a `HeaderBar`
 * as the `title` for the canonical GNOME layout.
 *
 * Compose with `ViewSwitcherItem` for each option.
 * Keyboard: ← / → cycle through items, Home / End jump to first / last.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ViewSwitcher.html
 * @see https://developer.gnome.org/hig/patterns/nav/view-switchers.html
 */
export const ViewSwitcher = ({
  children,
  className,
  'aria-label': ariaLabel = 'View switcher',
  ...props
}: ViewSwitcherProps) => {
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[role=radio]:not(:disabled)') ?? [],
    );
    const { activeElement } = document;
    const idx = activeElement instanceof HTMLButtonElement ? items.indexOf(activeElement) : -1;

    if (idx === -1) {
      return;
    }

    let next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (idx + 1) % items.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (idx - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = items.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    items[next].focus();
    items[next].click();
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={[styles.switcher, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};

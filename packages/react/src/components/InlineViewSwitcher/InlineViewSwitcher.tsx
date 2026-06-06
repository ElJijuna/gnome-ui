import {
  createContext,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useRef,
} from 'react';

import styles from './InlineViewSwitcher.module.css';

export type InlineViewSwitcherVariant = 'default' | 'flat' | 'round' | 'pill';

// ─── Internal context ──────────────────────────────────────────────────────────

interface InlineViewSwitcherContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const InlineViewSwitcherContext = createContext<InlineViewSwitcherContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useInlineViewSwitcher() {
  const ctx = useContext(InlineViewSwitcherContext);

  if (!ctx) {
    throw new Error('InlineViewSwitcherItem must be used inside InlineViewSwitcher');
  }

  return ctx;
}

// ─── InlineViewSwitcher ────────────────────────────────────────────────────────

export interface InlineViewSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  /** Currently active view name. */
  value: string;
  /** Called with the new value when a view is selected. */
  onValueChange: (value: string) => void;
  /**
   * Visual style of the switcher.
   * - `default` — card background with border and shadow (same as `ToggleGroup`).
   * - `flat`    — no background or border; active indicator only.
   * - `round`   — pill-shaped container and items.
   * - `pill`    — segmented-control style; active item appears lifted, no accent color.
   */
  variant?: InlineViewSwitcherVariant;
  /** Accessible label for the group. */
  'aria-label'?: string;
  children?: ReactNode;
}

/**
 * Compact inline view switcher for placing inside content areas, cards, or
 * toolbars — wherever `ViewSwitcher` (header-bar sized) would be too heavy.
 *
 * Built on `ToggleGroup` internals with `flat` and `round` style variants.
 * Mirrors `AdwInlineViewSwitcher` (libadwaita 1.7 / GNOME 48).
 *
 * Compose with `InlineViewSwitcherItem`. Keyboard: ← / → cycle, Home / End jump.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.InlineViewSwitcher.html
 */
export const InlineViewSwitcher = ({
  value,
  onValueChange,
  variant = 'default',
  'aria-label': ariaLabel = 'View switcher',
  children,
  className,
  ...props
}: InlineViewSwitcherProps) => {
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[role=radio]:not(:disabled)') ?? [],
    );
    const activeElement = document.activeElement;
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
    <InlineViewSwitcherContext.Provider value={{ value, onValueChange }}>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={[styles.switcher, styles[variant], className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    </InlineViewSwitcherContext.Provider>
  );
};

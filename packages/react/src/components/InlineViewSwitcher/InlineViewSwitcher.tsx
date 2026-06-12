import {
  Children,
  type CSSProperties,
  createContext,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { BottomSheet } from '../BottomSheet';
import { Icon } from '../Icon';

import styles from './InlineViewSwitcher.module.css';
import type { InlineViewSwitcherItemProps } from './InlineViewSwitcherItem';

export type InlineViewSwitcherVariant = 'default' | 'flat' | 'round' | 'pill';

export type InlineViewSwitcherOverflow = 'wrap' | 'scroll' | 'compact' | 'menu';

// ─── Internal context ──────────────────────────────────────────────────────────

interface InlineViewSwitcherContextValue {
  value: string;
  onValueChange: (value: string) => void;
  compact: boolean;
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
  /**
   * Overflow strategy when the container is too narrow for all items.
   * - `wrap`    — default; items overflow with no special handling.
   * - `scroll`  — horizontal scroll with hidden scrollbar.
   * - `compact` — collapses item labels to icons-only when overflowing (requires icons on all items).
   * - `menu`    — shows the active item and a chevron trigger; all items open in a BottomSheet.
   */
  overflow?: InlineViewSwitcherOverflow;
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
  overflow = 'wrap',
  'aria-label': ariaLabel = 'View switcher',
  children,
  className,
  ...props
}: InlineViewSwitcherProps) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const naturalWidthRef = useRef<number>(0);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({
    width: 0,
    transform: 'translateX(0)',
  });

  useEffect(() => {
    if (overflow !== 'compact' && overflow !== 'menu') {
      setIsOverflowing(false);
      return;
    }
    const el = groupRef.current;
    if (!el) {return;}

    const check = () => {
      setIsOverflowing((prev) => {
        if (!prev) {
          const scrollW = el.scrollWidth;
          if (scrollW > el.clientWidth) {
            naturalWidthRef.current = scrollW;
            return true;
          }
          return false;
        }
        // 30px hysteresis: stay collapsed until container is comfortably wider
        return naturalWidthRef.current > el.clientWidth + 30;
      });
    };

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [overflow]);

  const allItems = Children.toArray(children)
    .filter(isValidElement)
    .filter(
      (child) => (child.type as { displayName?: string }).displayName === 'InlineViewSwitcherItem',
    )
    .map((child) => (child as ReactElement<InlineViewSwitcherItemProps>).props);

  const activeItem = allItems.find((i) => i.name === value) ?? allItems[0];
  const compact = overflow === 'compact' && isOverflowing;
  const inMenuMode = overflow === 'menu' && isOverflowing;

  // Track active item position for the sliding indicator
  useLayoutEffect(() => {
    if (inMenuMode) {return;}
    const group = groupRef.current;
    if (!group) {return;}
    const activeEl = group.querySelector<HTMLElement>('[aria-checked="true"]');
    if (!activeEl) {return;}

    setIndicatorStyle({
      width: activeEl.offsetWidth,
      transform: `translateX(${activeEl.offsetLeft}px)`,
    });
     
  }, [value, inMenuMode, compact]);

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
    <InlineViewSwitcherContext.Provider value={{ value, onValueChange, compact }}>
      <div
        ref={groupRef}
        role={inMenuMode ? undefined : 'radiogroup'}
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={[
          styles.switcher,
          styles[variant],
          overflow === 'scroll' ? styles.overflowScroll : null,
          overflow === 'compact' || overflow === 'menu' ? styles.overflowDetect : null,
          compact ? styles.compact : null,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {!inMenuMode && <span className={styles.indicator} style={indicatorStyle} aria-hidden />}
        {inMenuMode ? (
          <>
            <button
              type="button"
              className={[styles.item, styles.active, styles.menuTrigger].filter(Boolean).join(' ')}
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              aria-label={`${ariaLabel}: ${activeItem?.label ?? activeItem?.name}`}
            >
              {activeItem?.icon && (
                <span className={styles.itemIcon}>
                  <Icon icon={activeItem.icon} size="md" aria-hidden />
                </span>
              )}
              {activeItem?.label && <span className={styles.itemLabel}>{activeItem.label}</span>}
              <span className={styles.menuChevron} aria-hidden="true">
                ▾
              </span>
            </button>
            <BottomSheet open={sheetOpen} title={ariaLabel} onClose={() => setSheetOpen(false)}>
              <div className={styles.menuList} role="radiogroup" aria-label={ariaLabel}>
                {allItems.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    role="radio"
                    aria-checked={item.name === value}
                    className={[
                      styles.menuListItem,
                      item.name === value ? styles.menuListItemActive : null,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      onValueChange(item.name);
                      setSheetOpen(false);
                    }}
                  >
                    {item.icon && (
                      <span className={styles.menuListItemIcon}>
                        <Icon icon={item.icon} size="md" aria-hidden />
                      </span>
                    )}
                    <span className={styles.menuListItemLabel}>{item.label ?? item.name}</span>
                    {item.name === value && (
                      <span className={styles.menuListItemCheck} aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </BottomSheet>
          </>
        ) : (
          children
        )}
      </div>
    </InlineViewSwitcherContext.Provider>
  );
};

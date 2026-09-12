import { usePrefersReducedMotion } from '@gnome-ui/hooks';
import { GoNext, GoNextRtl, GoPrevious, GoPreviousRtl } from '@gnome-ui/icons';
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

import { IconButton } from '@/components/IconButton';

import styles from './Tabs.module.css';

export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Accessible label for the tab list. */
  'aria-label'?: string;
  /**
   * Removes the header-bar background so the tab bar blends into any surface.
   * Use when placing the bar inside a card, content area, or custom container.
   * Mirrors the `.inline` style class.
   */
  inline?: boolean;
}

interface ScrollState {
  atStart: boolean;
  atEnd: boolean;
  rtl: boolean;
}

/**
 * `overflow-x: auto` alone gives touch users a way to reach tabs past the
 * edge (native swipe), but nothing tells a mouse/trackpad user — or anyone
 * who hasn't tried swiping — that there's more to see, especially since the
 * scrollbar itself is hidden. This tracks whether `.list` currently overflows
 * in each direction and which way is genuinely "forward" per the DOM's own
 * resolved `direction`, so the buttons rendered from it never have to guess.
 */
function useTabListScrollState(listRef: RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<ScrollState>({ atStart: true, atEnd: false, rtl: false });

  useEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const update = () => {
      const rtl = getComputedStyle(list).direction === 'rtl';
      // Modern engines agree `scrollLeft` ranges `[0, max]` in LTR and
      // `[-max, 0]` in RTL — its absolute distance from zero is the actual
      // scroll offset regardless of which one applies.
      const maxScroll = Math.max(0, list.scrollWidth - list.clientWidth);
      const scrolled = Math.min(maxScroll, Math.abs(list.scrollLeft));

      setState({ atStart: scrolled <= 1, atEnd: maxScroll - scrolled <= 1, rtl });
    };

    update();
    list.addEventListener('scroll', update, { passive: true });

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(list);
    }

    return () => {
      list.removeEventListener('scroll', update);
      observer?.disconnect();
    };
    // Re-measure whenever the tab list's own content changes (tabs added,
    // removed, or renamed) — `ResizeObserver` alone only fires on a layout
    // size change, not e.g. a label edit that keeps `scrollWidth` identical
    // by coincidence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef.current?.children.length]);

  return state;
}

/**
 * Horizontal tab bar that holds `TabItem` elements.
 *
 * Manages roving-tabindex keyboard navigation (← → Home End).
 *
 * When tabs overflow the bar, a "previous"/"next" button fades in at
 * whichever edge still has more to reveal — `.list`'s own `overflow-x: auto`
 * already lets touch users swipe there directly, but its scrollbar is
 * hidden, so mouse/trackpad users and anyone who hasn't discovered the
 * swipe get an explicit, always-visible way in too. Each press scrolls by
 * 80% of the bar's own width (a "page" of tabs), snapped instantly instead
 * of animated under `prefers-reduced-motion`.
 *
 * @see https://developer.gnome.org/hig/patterns/nav/tabs.html
 */
export const TabBar = ({
  children,
  className,
  inline = false,
  'aria-label': ariaLabel = 'Tabs',
  ...props
}: TabBarProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const { atStart, atEnd, rtl } = useTabListScrollState(listRef);
  const reducedMotion = usePrefersReducedMotion();

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role=tab]:not(:disabled)') ?? [],
    );
    const { activeElement } = document;
    const idx = activeElement instanceof HTMLButtonElement ? tabs.indexOf(activeElement) : -1;

    if (idx === -1) {
      return;
    }

    let next = idx;
    if (e.key === 'ArrowRight') {
      next = (idx + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      next = (idx - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    tabs[next].focus();
  }

  /** `forward` moves toward later tabs (`.scrollWidth`'s far end), `backward` toward earlier ones — independent of LTR/RTL sign conventions. */
  function scrollByPage(forward: boolean) {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const step = list.clientWidth * 0.8;
    const towardPositive = forward !== rtl;

    list.scrollBy({
      left: towardPositive ? step : -step,
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
  }

  return (
    <div
      className={[styles.bar, inline ? styles.inline : null, className].filter(Boolean).join(' ')}
      {...props}
    >
      {!atStart && (
        <span className={styles.scrollButton}>
          <IconButton
            icon={rtl ? GoNextRtl : GoPrevious}
            label="Scroll to previous tabs"
            variant="flat"
            size="sm"
            onClick={() => scrollByPage(false)}
          />
        </span>
      )}
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className={styles.list}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
      {!atEnd && (
        <span className={styles.scrollButton}>
          <IconButton
            icon={rtl ? GoPreviousRtl : GoNext}
            label="Scroll to next tabs"
            variant="flat"
            size="sm"
            onClick={() => scrollByPage(true)}
          />
        </span>
      )}
    </div>
  );
};

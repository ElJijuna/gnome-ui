import {
  Children,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './Carousel.module.css';

// ─── CarouselIndicatorDots ────────────────────────────────────────────────────

export interface CarouselIndicatorDotsProps extends HTMLAttributes<HTMLDivElement> {
  /** Total number of pages. */
  pages: number;
  /** Zero-based index of the current page. */
  currentPage: number;
  /** Called when the user clicks a dot. */
  onPageSelected?: (index: number) => void;
}

/**
 * Dot-style page indicator for `Carousel`.
 * Mirrors `AdwCarouselIndicatorDots`.
 */
export const CarouselIndicatorDots = ({
  pages,
  currentPage,
  onPageSelected,
  className,
  ...props
}: CarouselIndicatorDotsProps) => {
  return (
    <div
      className={[styles.indicatorDots, className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label="Carousel pages"
      {...props}
    >
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === currentPage}
          aria-label={`Page ${i + 1}`}
          className={[styles.dot, i === currentPage ? styles.dotActive : null]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onPageSelected?.(i)}
        />
      ))}
    </div>
  );
};

// ─── CarouselIndicatorLines ───────────────────────────────────────────────────

export interface CarouselIndicatorLinesProps extends HTMLAttributes<HTMLDivElement> {
  /** Total number of pages. */
  pages: number;
  /** Zero-based index of the current page. */
  currentPage: number;
  /** Called when the user clicks a line. */
  onPageSelected?: (index: number) => void;
}

/**
 * Line-style page indicator for `Carousel`.
 * Mirrors `AdwCarouselIndicatorLines`.
 */
export const CarouselIndicatorLines = ({
  pages,
  currentPage,
  onPageSelected,
  className,
  ...props
}: CarouselIndicatorLinesProps) => {
  return (
    <div
      className={[styles.indicatorLines, className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label="Carousel pages"
      {...props}
    >
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === currentPage}
          aria-label={`Page ${i + 1}`}
          className={[styles.line, i === currentPage ? styles.lineActive : null]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onPageSelected?.(i)}
        />
      ))}
    </div>
  );
};

// ─── Carousel ─────────────────────────────────────────────────────────────────

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /**
   * Scroll orientation.
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Gap between pages in px.
   * @default 0
   */
  spacing?: number;
  /**
   * Allow infinite looping (wraps around on the last/first page).
   * @default false
   */
  loop?: boolean;
  /**
   * Number of slides visible at once. Supports fractional values (e.g. `1.5`)
   * to peek at the edge of the next slide.
   * @default 1
   */
  visibleSlides?: number;
  /** Called whenever the visible page changes. */
  onPageChanged?: (index: number) => void;
  /**
   * Controlled current page index.
   * When omitted the carousel manages page state internally.
   */
  page?: number;
}

/**
 * Swipeable content carousel.
 *
 * Mirrors `AdwCarousel`. Uses CSS scroll-snapping for smooth, native-feeling
 * page transitions. Supports keyboard navigation (arrow keys), touch/mouse drag,
 * and velocity-based flick gestures.
 *
 * Pair with `CarouselIndicatorDots` or `CarouselIndicatorLines` for pagination UI.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Carousel.html
 */
export const Carousel = ({
  children,
  orientation = 'horizontal',
  spacing = 0,
  loop = false,
  visibleSlides = 1,
  onPageChanged,
  page: controlledPage,
  className,
  ...props
}: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageCount = Children.count(children);
  const [internalPage, setInternalPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;

  // Refs for drag state — avoids stale closures in pointer handlers
  const draggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({ pos: 0, scroll: 0, time: 0 });
  const snapRestoreTimerRef = useRef(0);

  // Scroll distance per page: (containerSize - spacing*(visibleSlides-1)) / visibleSlides + spacing
  // Simplifies to: (containerSize + spacing) / visibleSlides
  const getPageSize = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return 1;
    }
    const containerSize = orientation === 'horizontal' ? el.clientWidth : el.clientHeight;
    return (containerSize + spacing) / visibleSlides;
  }, [orientation, spacing, visibleSlides]);

  const scrollToPage = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const el = scrollRef.current;
      if (!el) {
        return;
      }
      const offset = getPageSize() * index;
      if (orientation === 'horizontal') {
        el.scrollTo({ left: offset, behavior });
      } else {
        el.scrollTo({ top: offset, behavior });
      }
    },
    [orientation, getPageSize],
  );

  // Scroll to the controlled page when it changes externally
  useEffect(() => {
    if (!isControlled) {
      return;
    }
    scrollToPage(controlledPage, 'smooth');
  }, [controlledPage, scrollToPage, isControlled]);

  // Detect page changes from native scroll (touch) — skipped during mouse drag
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const handleScroll = () => {
      if (draggingRef.current) {
        return;
      }
      const pageSize = getPageSize();
      const scroll = orientation === 'horizontal' ? el.scrollLeft : el.scrollTop;
      const idx = Math.round(scroll / pageSize);
      const clamped = Math.max(0, Math.min(idx, pageCount - 1));
      if (!isControlled) {
        setInternalPage(clamped);
      }
      onPageChanged?.(clamped);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [orientation, pageCount, isControlled, onPageChanged, getPageSize]);

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const isForward =
        orientation === 'horizontal' ? e.key === 'ArrowRight' : e.key === 'ArrowDown';
      const isBack = orientation === 'horizontal' ? e.key === 'ArrowLeft' : e.key === 'ArrowUp';

      if (!isForward && !isBack) {
        return;
      }
      e.preventDefault();

      const next = isForward
        ? loop
          ? (currentPage + 1) % pageCount
          : Math.min(currentPage + 1, pageCount - 1)
        : loop
          ? (currentPage - 1 + pageCount) % pageCount
          : Math.max(currentPage - 1, 0);

      scrollToPage(next);
      if (!isControlled) {
        setInternalPage(next);
      }
      onPageChanged?.(next);
    },
    [currentPage, pageCount, loop, orientation, scrollToPage, isControlled, onPageChanged],
  );

  // ── Drag (mouse + touch + pen) ───────────────────────────────────────────

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // Ignore non-primary mouse buttons
      if (e.pointerType === 'mouse' && e.button !== 0) {
        return;
      }
      const el = scrollRef.current;
      if (!el) {
        return;
      }

      // Disable scroll-snap immediately via DOM — not via React state, which would
      // only apply after the next render, letting scroll-snap fight the first moves.
      window.clearTimeout(snapRestoreTimerRef.current);
      el.style.scrollSnapType = 'none';

      // Capture so pointermove/up fire even when the pointer leaves the element
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      hasDraggedRef.current = false;
      setIsDragging(true);
      dragStartRef.current = {
        pos: orientation === 'horizontal' ? e.clientX : e.clientY,
        scroll: orientation === 'horizontal' ? el.scrollLeft : el.scrollTop,
        time: Date.now(),
      };
    },
    [orientation],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) {
        return;
      }
      const el = scrollRef.current;
      if (!el) {
        return;
      }

      const pos = orientation === 'horizontal' ? e.clientX : e.clientY;
      const delta = dragStartRef.current.pos - pos;

      if (Math.abs(delta) > 4) {
        hasDraggedRef.current = true;
      }

      // Apply boundary resistance: dampen movement past first/last slide
      const maxScroll =
        orientation === 'horizontal'
          ? el.scrollWidth - el.clientWidth
          : el.scrollHeight - el.clientHeight;
      let newScroll = dragStartRef.current.scroll + delta;

      if (newScroll < 0) {
        newScroll *= 0.3;
      } else if (newScroll > maxScroll) {
        newScroll = maxScroll + (newScroll - maxScroll) * 0.3;
      }

      if (orientation === 'horizontal') {
        el.scrollLeft = newScroll;
      } else {
        el.scrollTop = newScroll;
      }
    },
    [orientation],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) {
        return;
      }

      draggingRef.current = false;
      setIsDragging(false);

      const el = scrollRef.current;

      if (!hasDraggedRef.current || !el) {
        // No real drag — restore snap immediately
        el?.style.removeProperty('scroll-snap-type');
        return;
      }

      const isCancel = e.type === 'pointercancel';
      const pos = isCancel
        ? dragStartRef.current.pos
        : orientation === 'horizontal'
          ? e.clientX
          : e.clientY;

      const delta = dragStartRef.current.pos - pos;
      const elapsed = Math.max(Date.now() - dragStartRef.current.time, 1);
      const velocity = isCancel ? 0 : delta / elapsed; // px/ms, positive = forward
      const pageSize = getPageSize();
      const scroll = orientation === 'horizontal' ? el.scrollLeft : el.scrollTop;

      let target: number;
      if (Math.abs(velocity) > 0.3) {
        // Flick gesture — advance in the swipe direction
        target = velocity > 0 ? Math.ceil(scroll / pageSize) : Math.floor(scroll / pageSize);
      } else {
        // Slow drag — snap to nearest page
        target = Math.round(scroll / pageSize);
      }

      if (loop) {
        target = ((target % pageCount) + pageCount) % pageCount;
      } else {
        target = Math.max(0, Math.min(target, pageCount - 1));
      }

      // Scroll to target while snap is still disabled, then re-enable once settled
      scrollToPage(target);
      if (!isControlled) {
        setInternalPage(target);
      }
      onPageChanged?.(target);

      // Re-enable snap after the smooth scroll animation completes (~300 ms)
      snapRestoreTimerRef.current = window.setTimeout(() => {
        el.style.removeProperty('scroll-snap-type');
      }, 350);
    },
    [orientation, getPageSize, loop, pageCount, scrollToPage, isControlled, onPageChanged],
  );

  // Clean up the snap-restore timer on unmount
  useEffect(() => {
    return () => window.clearTimeout(snapRestoreTimerRef.current);
  }, []);

  // Prevent click events that fire after a drag (e.g. links/buttons inside slides)
  const handleClick = useCallback((e: MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  }, []);

  const isHorizontal = orientation === 'horizontal';

  // Slide width when showing more than one at a time
  const slideFlexBasis =
    visibleSlides !== 1
      ? `calc((100% - ${spacing * (visibleSlides - 1)}px) / ${visibleSlides})`
      : undefined;

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      className={[
        styles.carousel,
        isHorizontal ? styles.horizontal : styles.vertical,
        isDragging ? styles.dragging : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={isHorizontal ? { columnGap: spacing || undefined } : { rowGap: spacing || undefined }}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      {...props}
    >
      {Children.map(children, (child, i) => (
        <div
          key={i}
          className={styles.slide}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${pageCount}`}
          style={slideFlexBasis ? { flex: `0 0 ${slideFlexBasis}` } : undefined}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

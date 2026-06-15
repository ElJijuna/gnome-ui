import {
  Children,
  type CSSProperties,
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

type IndicatorPosition = 'top' | 'bottom' | 'left' | 'right';

const INDICATOR_FLEX_DIR: Record<IndicatorPosition, CSSProperties['flexDirection']> = {
  bottom: 'column',
  top: 'column-reverse',
  left: 'row-reverse',
  right: 'row',
};

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
   * Number of slides visible at once (integer ≥ 1). Navigation advances one
   * full group at a time, and the indicator shows one dot/line per group.
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
  /**
   * Automatically advance to the next slide. Pauses while the pointer
   * hovers over the carousel or during drag.
   * @default false
   */
  autoPlay?: boolean;
  /**
   * Milliseconds between automatic slide transitions.
   * Only used when `autoPlay` is `true`.
   * @default 3000
   */
  interval?: number;
  /**
   * Page indicator rendered alongside the carousel.
   * - `'dots'`: small circular dots (`CarouselIndicatorDots`)
   * - `'lines'`: short line segments (`CarouselIndicatorLines`)
   * - `'none'` or omitted: no indicator
   */
  indicator?: 'dots' | 'lines' | 'none';
  /**
   * Position of the indicator relative to the carousel.
   * @default 'bottom'
   */
  indicatorPosition?: IndicatorPosition;
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
  autoPlay = false,
  interval = 3000,
  indicator,
  indicatorPosition = 'bottom',
  className,
  style,
  ...props
}: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const vSlides = Math.max(1, Math.floor(visibleSlides)); // enforce integer
  const slideCount = Children.count(children);
  const pageCount = Math.ceil(slideCount / vSlides);
  const [internalPage, setInternalPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;

  // Refs for drag state — avoids stale closures in pointer handlers
  const draggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({ pos: 0, scroll: 0, time: 0 });
  const snapRestoreTimerRef = useRef(0);
  // Suppresses handleScroll feedback during programmatic scrolls (e.g. dot clicks)
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef(0);
  // Auto-play: always-fresh snapshot of currentPage to avoid stale closure in setInterval
  const currentPageRef = useRef(currentPage);
  const isHoveringRef = useRef(false);
  useEffect(() => {
    currentPageRef.current = currentPage;
  });

  // Scroll distance per page = one full group = containerSize + spacing.
  // Each slide is (containerSize - spacing*(vSlides-1)) / vSlides wide, so
  // vSlides slides + (vSlides-1) gaps = containerSize, plus the inter-group
  // gap gives containerSize + spacing.
  const getPageSize = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return 1;
    }
    const containerSize = orientation === 'horizontal' ? el.clientWidth : el.clientHeight;
    const size = containerSize + spacing;
    return size > 0 ? size : 1;
  }, [orientation, spacing]);

  const scrollToPage = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const el = scrollRef.current;
      if (!el) {
        return;
      }
      // Suppress handleScroll feedback while the animation runs
      isProgrammaticScrollRef.current = true;
      window.clearTimeout(programmaticScrollTimerRef.current);
      programmaticScrollTimerRef.current = window.setTimeout(
        () => {
          isProgrammaticScrollRef.current = false;
        },
        behavior === 'smooth' ? 400 : 50,
      );

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
      if (draggingRef.current || isProgrammaticScrollRef.current) {
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

      const maxScroll =
        orientation === 'horizontal'
          ? el.scrollWidth - el.clientWidth
          : el.scrollHeight - el.clientHeight;

      let target: number;
      if (Math.abs(velocity) > 0.3) {
        const rawTarget =
          velocity > 0 ? Math.ceil(scroll / pageSize) : Math.floor(scroll / pageSize);
        // In loop mode the browser clamps scroll to [0, maxScroll], so a backward
        // flick from page 0 and a forward flick from the last page both produce a
        // rawTarget stuck at the boundary. Detect and wrap explicitly.
        if (loop && velocity < 0 && rawTarget === 0 && scroll <= 0) {
          target = pageCount - 1;
        } else if (loop && velocity > 0 && rawTarget === pageCount - 1 && scroll >= maxScroll) {
          target = 0;
        } else {
          target = rawTarget;
        }
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

  // Auto-play: advance one slide every `interval` ms, pausing on hover/drag
  useEffect(() => {
    if (!autoPlay || interval <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      if (draggingRef.current || isHoveringRef.current) {
        return;
      }
      const page = currentPageRef.current;
      if (!loop && page >= pageCount - 1) {
        return;
      }
      const next = loop ? (page + 1) % pageCount : page + 1;
      // Update ref immediately so back-to-back ticks see the correct page
      currentPageRef.current = next;
      scrollToPage(next);
      if (!isControlled) {
        setInternalPage(next);
      }
      onPageChanged?.(next);
    }, interval);

    return () => window.clearInterval(timer);
  }, [autoPlay, interval, loop, pageCount, scrollToPage, isControlled, onPageChanged]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      window.clearTimeout(snapRestoreTimerRef.current);
      window.clearTimeout(programmaticScrollTimerRef.current);
    };
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
  const showIndicator = indicator === 'dots' || indicator === 'lines';
  const isSide = indicatorPosition === 'left' || indicatorPosition === 'right';

  // Slide width when showing more than one at a time
  const slideFlexBasis =
    vSlides !== 1
      ? `calc((100% - ${spacing * (vSlides - 1)}px) / ${vSlides})`
      : undefined;

  const scrollContainer = (
    <div
      ref={scrollRef}
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      className={[
        styles.carousel,
        isHorizontal ? styles.horizontal : styles.vertical,
        isDragging ? styles.dragging : null,
        showIndicator ? null : className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...(isHorizontal ? { columnGap: spacing || undefined } : { rowGap: spacing || undefined }),
        ...(showIndicator && (isSide ? { flex: '1 1 0', width: 'auto' } : { flex: '1 1 auto' })),
      }}
      onMouseEnter={() => {
        isHoveringRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveringRef.current = false;
      }}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      {...(showIndicator ? {} : props)}
    >
      {Children.map(children, (child, i) => (
        <div
          key={i}
          className={styles.slide}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slideCount}`}
          style={{
            ...(slideFlexBasis ? { flex: `0 0 ${slideFlexBasis}` } : undefined),
            // Only the first slide of each group is a snap target; intermediate
            // slides would cause the carousel to stop mid-group.
            ...(vSlides > 1 && i % vSlides !== 0 ? { scrollSnapAlign: 'none' } : undefined),
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );

  if (!showIndicator) {
    return scrollContainer;
  }

  const onPageSelected = (i: number) => {
    scrollToPage(i);
    if (!isControlled) setInternalPage(i);
    onPageChanged?.(i);
  };

  const indicatorStyle: CSSProperties | undefined = isSide
    ? { flexDirection: 'column', padding: '0 12px' }
    : undefined;

  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex',
        flexDirection: INDICATOR_FLEX_DIR[indicatorPosition],
      }}
      {...props}
    >
      {scrollContainer}
      {indicator === 'dots' && (
        <CarouselIndicatorDots
          pages={pageCount}
          currentPage={currentPage}
          onPageSelected={onPageSelected}
          style={indicatorStyle}
        />
      )}
      {indicator === 'lines' && (
        <CarouselIndicatorLines
          pages={pageCount}
          currentPage={currentPage}
          onPageSelected={onPageSelected}
          style={indicatorStyle}
        />
      )}
    </div>
  );
};

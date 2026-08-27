import {
  Children,
  type CSSProperties,
  type HTMLAttributes,
  isValidElement,
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

// ─── CarouselArrow ────────────────────────────────────────────────────────────

const CHEVRON_PATHS = {
  left: 'M10 4L6 8l4 4',
  right: 'M6 4l4 4-4 4',
  up: 'M4 10l4-4 4 4',
  down: 'M4 6l4 4 4-4',
} as const;

/** Stable key for a slide wrapper — reuse the child's own key when it has one. */
const keyOf = (node: ReactNode, index: number) =>
  isValidElement(node) && node.key !== null ? `slide-${node.key}` : `slide-${index}`;

const ArrowChevron = ({ direction }: { direction: keyof typeof CHEVRON_PATHS }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" focusable="false" aria-hidden="true">
    <path
      d={CHEVRON_PATHS[direction]}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
   * Wrap around when navigating past the last or first page. The carousel jumps
   * straight back to the other end — use `infinite` for a seamless circular
   * motion instead.
   * @default false
   */
  loop?: boolean;
  /**
   * Seamless circular carousel: a copy of the last page is rendered before the
   * first one (and vice versa), so paging past either end keeps moving in the
   * same direction instead of rewinding. The carousel silently repositions onto
   * the real page once the animation settles.
   *
   * Implies `loop`. The clones are copies of your children, so avoid it for
   * slides that own uncloneable side effects (autoplaying media, unique DOM ids).
   * Motion is perfectly seamless when the slide count is a multiple of
   * `visibleSlides`; otherwise the last group overlaps and the wrap shifts by
   * the remainder.
   * @default false
   */
  infinite?: boolean;
  /**
   * How much of the neighbouring slides peeks in at each edge — a number in px
   * or any CSS length (`'10%'`, `'2rem'`). The active group shrinks to make
   * room, so paging still moves exactly one group. `spacing` is added on top,
   * so this is the amount of the neighbour you actually see.
   * @default 0
   */
  peek?: number | string;
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
  /**
   * Show previous/next arrow buttons overlaid on the carousel edges.
   * Hidden automatically when there is only a single page.
   * @default false
   */
  arrows?: boolean;
  /**
   * Accessible label for the previous-page arrow.
   * @default 'Previous slide'
   */
  previousLabel?: string;
  /**
   * Accessible label for the next-page arrow.
   * @default 'Next slide'
   */
  nextLabel?: string;
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
  infinite = false,
  peek = 0,
  visibleSlides = 1,
  onPageChanged,
  page: controlledPage,
  autoPlay = false,
  interval = 3000,
  indicator,
  indicatorPosition = 'bottom',
  arrows = false,
  previousLabel = 'Previous slide',
  nextLabel = 'Next slide',
  className,
  style,
  ...props
}: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const vSlides = Math.max(1, Math.floor(visibleSlides)); // enforce integer
  const slideCount = Children.count(children);
  const pageCount = Math.ceil(slideCount / vSlides);
  // `infinite` is a stronger `loop`: both wrap, only `infinite` clones.
  const wraps = loop || infinite;
  // Nothing to clone when everything already fits in one page.
  const cloned = infinite && slideCount > vSlides;
  // Scroll positions are counted in *units* of one page. With clones, unit 0 is
  // the leading copy of the last page, so real page `p` lives at unit `p + 1`.
  const leadUnits = cloned ? 1 : 0;
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
  const loopFixTimerRef = useRef(0);
  // Auto-play: always-fresh snapshot of currentPage to avoid stale closure in setInterval
  const currentPageRef = useRef(currentPage);
  const isHoveringRef = useRef(false);
  useEffect(() => {
    currentPageRef.current = currentPage;
  });

  // Scroll distance per page = one full group = vSlides * (slide + spacing).
  // Measured off a real slide rather than derived from the container, so `peek`
  // padding (which may be a percentage or any CSS length) is accounted for.
  const getPageSize = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return 1;
    }
    const first = el.firstElementChild;
    const rect = first?.getBoundingClientRect();
    const slideSize = rect
      ? orientation === 'horizontal'
        ? rect.width
        : rect.height
      : orientation === 'horizontal'
        ? el.clientWidth
        : el.clientHeight;
    const size = vSlides * (slideSize + spacing);
    return size > 0 ? size : 1;
  }, [orientation, spacing, vSlides]);

  /** Mute the scroll listener while a scroll we started is still running. */
  const suppressScrollFeedback = useCallback((ms: number) => {
    isProgrammaticScrollRef.current = true;
    window.clearTimeout(programmaticScrollTimerRef.current);
    programmaticScrollTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, ms);
  }, []);

  /**
   * Rewind from a clone onto the real page it copies. Runs once the scroll has
   * settled and jumps instantly, so the swap is invisible.
   */
  const normalizeLoop = useCallback(() => {
    const el = scrollRef.current;
    if (!cloned || !el) {
      return;
    }
    const pageSize = getPageSize();
    const scroll = orientation === 'horizontal' ? el.scrollLeft : el.scrollTop;
    const page = Math.round(scroll / pageSize) - leadUnits;
    if (page >= 0 && page < pageCount) {
      return;
    }
    const wrapped = ((page % pageCount) + pageCount) % pageCount;
    const offset = (wrapped + leadUnits) * pageSize;
    suppressScrollFeedback(80);
    if (orientation === 'horizontal') {
      el.scrollTo({ left: offset, behavior: 'auto' });
    } else {
      el.scrollTo({ top: offset, behavior: 'auto' });
    }
  }, [cloned, orientation, leadUnits, pageCount, getPageSize, suppressScrollFeedback]);

  /** Scroll to an absolute unit — may point at a clone when `infinite` is on. */
  const scrollToUnit = useCallback(
    (unit: number, behavior: ScrollBehavior = 'smooth') => {
      const el = scrollRef.current;
      if (!el) {
        return;
      }
      const settle = behavior === 'smooth' ? 400 : 50;
      suppressScrollFeedback(settle);

      const offset = getPageSize() * unit;
      if (orientation === 'horizontal') {
        el.scrollTo({ left: offset, behavior });
      } else {
        el.scrollTo({ top: offset, behavior });
      }

      if (cloned) {
        window.clearTimeout(loopFixTimerRef.current);
        loopFixTimerRef.current = window.setTimeout(normalizeLoop, settle + 20);
      }
    },
    [orientation, getPageSize, cloned, normalizeLoop, suppressScrollFeedback],
  );

  const scrollToPage = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') =>
      scrollToUnit(index + leadUnits, behavior),
    [scrollToUnit, leadUnits],
  );

  /** Commit a page as the current one without moving the scroll position. */
  const commitPage = useCallback(
    (index: number) => {
      currentPageRef.current = index;
      if (!isControlled) {
        setInternalPage(index);
      }
      onPageChanged?.(index);
    },
    [isControlled, onPageChanged],
  );

  /** Jump straight to `index` (indicator clicks). */
  const goToPage = useCallback(
    (index: number) => {
      scrollToPage(index);
      commitPage(index);
    },
    [scrollToPage, commitPage],
  );

  /**
   * Move `delta` pages. Reads the page from a ref so the callback stays stable
   * across page changes — auto-play depends on that to keep one interval alive.
   */
  const navigate = useCallback(
    (delta: number) => {
      const raw = currentPageRef.current + delta;
      const wrapped = ((raw % pageCount) + pageCount) % pageCount;
      const next = wraps ? wrapped : Math.max(0, Math.min(raw, pageCount - 1));
      // With clones, keep travelling in the same direction onto the cloned page;
      // normalizeLoop rewinds onto the real one after the animation settles.
      scrollToUnit((cloned && raw !== wrapped ? raw : next) + leadUnits);
      commitPage(next);
    },
    [pageCount, wraps, cloned, leadUnits, scrollToUnit, commitPage],
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
      const idx = Math.round(scroll / pageSize) - leadUnits;
      const settled = cloned
        ? ((idx % pageCount) + pageCount) % pageCount
        : Math.max(0, Math.min(idx, pageCount - 1));
      commitPage(settled);

      if (cloned) {
        // Scrolls we did not start (wheel, trackpad) can also land on a clone.
        window.clearTimeout(loopFixTimerRef.current);
        loopFixTimerRef.current = window.setTimeout(normalizeLoop, 150);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [orientation, pageCount, cloned, leadUnits, commitPage, normalizeLoop, getPageSize]);

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
      navigate(isForward ? 1 : -1);
    },
    [orientation, navigate],
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

      let unit: number;
      if (Math.abs(velocity) > 0.3) {
        const rawUnit = velocity > 0 ? Math.ceil(scroll / pageSize) : Math.floor(scroll / pageSize);
        // Plain `loop` has no clones, so the browser clamps scroll to
        // [0, maxScroll]: a backward flick from page 0 and a forward flick from
        // the last page both stick at the boundary. Detect and wrap explicitly.
        // `infinite` needs none of this — there is real content on both sides.
        if (wraps && !cloned && velocity < 0 && rawUnit === 0 && scroll <= 0) {
          unit = -1;
        } else if (
          wraps &&
          !cloned &&
          velocity > 0 &&
          rawUnit === pageCount - 1 &&
          scroll >= maxScroll
        ) {
          unit = pageCount;
        } else {
          unit = rawUnit;
        }
      } else {
        // Slow drag — snap to nearest page
        unit = Math.round(scroll / pageSize);
      }

      const raw = unit - leadUnits;
      const target = wraps
        ? ((raw % pageCount) + pageCount) % pageCount
        : Math.max(0, Math.min(raw, pageCount - 1));

      // Scroll to target while snap is still disabled, then re-enable once settled.
      // With clones we land where the finger left off — even on a clone — and
      // normalizeLoop rewinds behind the scenes.
      scrollToUnit(
        cloned ? Math.max(0, Math.min(unit, pageCount + leadUnits)) : target + leadUnits,
      );
      commitPage(target);

      // Re-enable snap after the smooth scroll animation completes (~300 ms)
      snapRestoreTimerRef.current = window.setTimeout(() => {
        el.style.removeProperty('scroll-snap-type');
      }, 350);
    },
    [orientation, getPageSize, wraps, cloned, leadUnits, pageCount, scrollToUnit, commitPage],
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
      if (!wraps && currentPageRef.current >= pageCount - 1) {
        return;
      }
      // navigate() updates currentPageRef synchronously, so back-to-back ticks
      // see the right page without restarting the interval.
      navigate(1);
    }, interval);

    return () => window.clearInterval(timer);
  }, [autoPlay, interval, wraps, pageCount, navigate]);

  // Page offsets are pixel measurements, and with clones page 0 does not sit at
  // scroll 0 — so put the current page back in place on mount and on resize.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const reposition = () => {
      // Skip when already in place, so the common case never mutes the scroll
      // listener or fights a scroll in progress.
      const target = (currentPageRef.current + leadUnits) * getPageSize();
      const current = orientation === 'horizontal' ? el.scrollLeft : el.scrollTop;
      if (Math.abs(current - target) < 1) {
        return;
      }
      scrollToPage(currentPageRef.current, 'auto');
    };
    reposition();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', reposition);
      return () => window.removeEventListener('resize', reposition);
    }

    const observer = new ResizeObserver(reposition);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollToPage, getPageSize, orientation, leadUnits]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      window.clearTimeout(snapRestoreTimerRef.current);
      window.clearTimeout(programmaticScrollTimerRef.current);
      window.clearTimeout(loopFixTimerRef.current);
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
  // A single page has nowhere to go — don't render dead arrows.
  const showArrows = arrows && pageCount > 1;
  // Anything but a bare scroll container needs a host for `className`/`style`/rest props.
  const isWrapped = showIndicator || showArrows;

  // When an indicator sits alongside, the outer flex child must absorb the
  // leftover space — that's the arrow viewport when present, else the track.
  const flexFill: CSSProperties | undefined = showIndicator
    ? isSide
      ? { flex: '1 1 0', width: 'auto' }
      : { flex: '1 1 auto' }
    : undefined;

  // Slide width when showing more than one at a time. Percentages resolve
  // against the track's content box, so `peek` padding is already subtracted.
  const slideFlexBasis =
    vSlides !== 1 ? `calc((100% - ${spacing * (vSlides - 1)}px) / ${vSlides})` : undefined;

  // `peek` is inset as padding on the track: it shrinks the slides (percentage
  // basis) and the matching scroll-padding keeps page N snapping at N * pageSize.
  // The inter-group gap falls inside that inset, so add it back — `peek` should
  // be what you actually see of the neighbour, not what the gap leaves over.
  const peekValue =
    peek === 0 || peek === ''
      ? undefined
      : typeof peek === 'number'
        ? `${peek + spacing}px`
        : spacing
          ? `calc(${peek} + ${spacing}px)`
          : peek;

  const childArray = Children.toArray(children);
  // Clone one page in front and enough behind to both complete a ragged last
  // page and provide a full page to travel onto when wrapping forward.
  const trailingClones = cloned ? pageCount * vSlides - slideCount + vSlides : 0;
  const physicalSlides: { node: ReactNode; key: string; index: number | null }[] = cloned
    ? [
        ...Array.from({ length: vSlides }, (_, k) => {
          const index = ((pageCount - 1) * vSlides + k) % slideCount;
          return { node: childArray[index], key: `lead-${k}`, index: null };
        }),
        ...childArray.map((node, index) => ({ node, key: keyOf(node, index), index })),
        ...Array.from({ length: trailingClones }, (_, k) => ({
          node: childArray[k % slideCount],
          key: `trail-${k}`,
          index: null,
        })),
      ]
    : childArray.map((node, index) => ({ node, key: keyOf(node, index), index }));

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
        isWrapped ? null : className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...(isWrapped ? undefined : style),
        ...(isHorizontal
          ? {
              columnGap: spacing || undefined,
              paddingInline: peekValue,
              scrollPaddingInline: peekValue,
            }
          : {
              rowGap: spacing || undefined,
              paddingBlock: peekValue,
              scrollPaddingBlock: peekValue,
            }),
        ...(showArrows ? undefined : flexFill),
      }}
      onMouseEnter={() => {
        isHoveringRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveringRef.current = false;
      }}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      {...(isWrapped ? {} : props)}
    >
      {physicalSlides.map(({ node, key, index }, i) => (
        <div
          key={key}
          className={styles.slide}
          // Clones duplicate their subtree, so keep them out of the a11y tree and
          // out of the tab order. `inert` retargets pointer events to the track,
          // which is why the drag handlers live there and not on the slides.
          {...(index === null
            ? { 'aria-hidden': true, inert: true }
            : {
                role: 'group',
                'aria-roledescription': 'slide',
                'aria-label': `${index + 1} of ${slideCount}`,
              })}
          style={{
            ...(slideFlexBasis ? { flex: `0 0 ${slideFlexBasis}` } : undefined),
            // Only the first slide of each group is a snap target; intermediate
            // slides would cause the carousel to stop mid-group.
            ...(vSlides > 1 && i % vSlides !== 0 ? { scrollSnapAlign: 'none' } : undefined),
          }}
        >
          {node}
        </div>
      ))}
    </div>
  );

  const renderArrow = (dir: 'prev' | 'next') => {
    const isPrev = dir === 'prev';
    const disabled = !wraps && (isPrev ? currentPage <= 0 : currentPage >= pageCount - 1);

    return (
      <button
        type="button"
        className={[styles.arrow, isPrev ? styles.arrowPrev : styles.arrowNext].join(' ')}
        aria-label={isPrev ? previousLabel : nextLabel}
        disabled={disabled}
        onClick={() => navigate(isPrev ? -1 : 1)}
      >
        <ArrowChevron
          direction={isHorizontal ? (isPrev ? 'left' : 'right') : isPrev ? 'up' : 'down'}
        />
      </button>
    );
  };

  // Arrows are absolutely positioned against this viewport, so they stay pinned
  // to the visible edges instead of scrolling away with the track.
  const content = showArrows ? (
    <div
      className={[
        styles.viewport,
        isHorizontal ? styles.viewportHorizontal : styles.viewportVertical,
        showIndicator ? null : className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...(showIndicator ? undefined : style), ...flexFill }}
      {...(showIndicator ? {} : props)}
    >
      {scrollContainer}
      {renderArrow('prev')}
      {renderArrow('next')}
    </div>
  ) : (
    scrollContainer
  );

  if (!showIndicator) {
    return content;
  }

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
      {content}
      {indicator === 'dots' && (
        <CarouselIndicatorDots
          pages={pageCount}
          currentPage={currentPage}
          onPageSelected={goToPage}
          style={indicatorStyle}
        />
      )}
      {indicator === 'lines' && (
        <CarouselIndicatorLines
          pages={pageCount}
          currentPage={currentPage}
          onPageSelected={goToPage}
          style={indicatorStyle}
        />
      )}
    </div>
  );
};

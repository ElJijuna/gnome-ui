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

const defaultPageLabel = (index: number) => `Page ${index + 1}`;
const defaultSlideLabel = (index: number, total: number) => `${index + 1} of ${total}`;

// ─── CarouselIndicatorDots ────────────────────────────────────────────────────

export interface CarouselIndicatorDotsProps extends HTMLAttributes<HTMLDivElement> {
  /** Total number of pages. */
  pages: number;
  /** Zero-based index of the current page. */
  currentPage: number;
  /** Called when the user clicks a dot. */
  onPageSelected?: (index: number) => void;
  /** Accessible name for each page button. @default `Page ${index + 1}` */
  pageLabel?: (index: number, total: number) => string;
  /**
   * Accessible name for the indicator as a whole.
   * @default 'Carousel pages'
   */
  label?: string;
}

/**
 * Dot-style page indicator for `Carousel`.
 * Mirrors `AdwCarouselIndicatorDots`.
 */
export const CarouselIndicatorDots = ({
  pages,
  currentPage,
  onPageSelected,
  pageLabel = defaultPageLabel,
  label = 'Carousel pages',
  className,
  ...props
}: CarouselIndicatorDotsProps) => {
  return (
    // Not a `tablist`: there are no tabpanels to control, and the role would
    // promise roving-tabindex arrow navigation that a page picker does not have.
    <div
      className={[styles.indicatorDots, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
      {...props}
    >
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === currentPage ? 'true' : undefined}
          aria-label={pageLabel(i, pages)}
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
  /** Accessible name for each page button. @default `Page ${index + 1}` */
  pageLabel?: (index: number, total: number) => string;
  /**
   * Accessible name for the indicator as a whole.
   * @default 'Carousel pages'
   */
  label?: string;
}

/**
 * Line-style page indicator for `Carousel`.
 * Mirrors `AdwCarouselIndicatorLines`.
 */
export const CarouselIndicatorLines = ({
  pages,
  currentPage,
  onPageSelected,
  pageLabel = defaultPageLabel,
  label = 'Carousel pages',
  className,
  ...props
}: CarouselIndicatorLinesProps) => {
  return (
    // Not a `tablist`: there are no tabpanels to control, and the role would
    // promise roving-tabindex arrow navigation that a page picker does not have.
    <div
      className={[styles.indicatorLines, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
      {...props}
    >
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === currentPage ? 'true' : undefined}
          aria-label={pageLabel(i, pages)}
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

/**
 * A `behavior: 'smooth'` passed to `scrollTo` wins over the stylesheet's
 * `scroll-behavior`, so honouring reduced motion has to happen here rather than
 * in CSS alone.
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

const PlayPauseGlyph = ({ playing }: { playing: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" focusable="false" aria-hidden="true">
    {playing ? (
      <path d="M5 3h2.5v10H5zm3.5 0H11v10H8.5z" fill="currentColor" />
    ) : (
      <path d="M5 3l7 5-7 5z" fill="currentColor" />
    )}
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
   * Shrink the slides that are not on the current page, so the active ones read
   * as the focus of the carousel. `true` scales them to 80% — 20% smaller —
   * and a number sets that scale explicitly (`0.9` for a subtler effect).
   *
   * Purely visual: the slides keep their layout size, so paging is unaffected.
   * Best paired with `peek`, which is what puts the shrunken neighbours on screen.
   * @default false
   */
  focusActiveSlides?: boolean | number;
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
  /** Called whenever the visible page changes — once per actual change. */
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
   * Render a play/pause button while `autoPlay` is on. Automatically moving
   * content needs a way to stop it (WCAG 2.2.2), so turn this off only when you
   * provide your own control.
   * @default true
   */
  autoPlayControl?: boolean;
  /**
   * Accessible name for the carousel as a whole. `role="region"` is dropped from
   * the landmark tree without one.
   * @default 'Carousel'
   */
  label?: string;
  /**
   * Accessible name for the indicator as a whole.
   * @default 'Carousel pages'
   */
  indicatorLabel?: string;
  /** Accessible name for each indicator button. @default `Page ${index + 1}` */
  pageLabel?: (index: number, total: number) => string;
  /** Accessible name for each slide. @default `${index + 1} of ${total}` */
  slideLabel?: (index: number, total: number) => string;
  /**
   * Accessible label for the auto-play pause button.
   * @default 'Pause automatic slide rotation'
   */
  pauseLabel?: string;
  /**
   * Accessible label for the auto-play resume button.
   * @default 'Resume automatic slide rotation'
   */
  playLabel?: string;
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
  focusActiveSlides = false,
  visibleSlides = 1,
  onPageChanged,
  page: controlledPage,
  autoPlay = false,
  interval = 3000,
  indicator,
  indicatorPosition = 'bottom',
  arrows = false,
  autoPlayControl = true,
  label = 'Carousel',
  indicatorLabel = 'Carousel pages',
  pageLabel = defaultPageLabel,
  slideLabel = defaultSlideLabel,
  pauseLabel = 'Pause automatic slide rotation',
  playLabel = 'Resume automatic slide rotation',
  previousLabel = 'Previous slide',
  nextLabel = 'Next slide',
  className,
  style,
  ...props
}: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const vSlides = Math.max(1, Math.floor(visibleSlides)); // enforce integer
  const slideCount = Children.count(children);
  // Floored at 1: an empty carousel still has to divide cleanly, or the modulo
  // arithmetic in `navigate` turns every page index into NaN.
  const pageCount = Math.max(1, Math.ceil(slideCount / vSlides));
  // `infinite` is a stronger `loop`: both wrap, only `infinite` clones.
  const wraps = loop || infinite;
  // Nothing to clone when everything already fits in one page.
  const cloned = infinite && slideCount > vSlides;
  // Scroll positions are counted in *units* of one page. With clones, unit 0 is
  // the leading copy of the last page, so real page `p` lives at unit `p + 1`.
  const leadUnits = cloned ? 1 : 0;
  const axis = orientation === 'horizontal' ? 'width' : 'height';
  const [internalPage, setInternalPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
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
  // Held in a ref so `commitPage` stays stable across renders — it is a
  // dependency of the scroll listener, which an inline callback would otherwise
  // detach and reattach on every single render.
  const onPageChangedRef = useRef(onPageChanged);
  const isHoveringRef = useRef(false);
  // Keyboard users cannot hover, so focus has to pause the rotation for them.
  const isFocusedRef = useRef(false);
  useEffect(() => {
    currentPageRef.current = currentPage;
    onPageChangedRef.current = onPageChanged;
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
    // Computed style, not getBoundingClientRect: `focusActiveSlides` scales the
    // slides, and a transform would shrink the measured box along with them.
    const computed = first ? parseFloat(getComputedStyle(first)[axis]) : Number.NaN;
    const slideSize = Number.isFinite(computed)
      ? computed
      : orientation === 'horizontal'
        ? el.clientWidth
        : el.clientHeight;
    const size = vSlides * (slideSize + spacing);
    return size > 0 ? size : 1;
  }, [orientation, spacing, vSlides, axis]);

  /** Mute the scroll listener while a scroll we started is still running. */
  const suppressScrollFeedback = useCallback((ms: number) => {
    isProgrammaticScrollRef.current = true;
    window.clearTimeout(programmaticScrollTimerRef.current);
    programmaticScrollTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, ms);
  }, []);

  /**
   * Put the scroll position back in the same cycle as the page we are logically
   * on. Shifting by a whole cycle is pixel-identical — that is what the clones
   * are for — so this is invisible, and it works on a scroll that is still
   * animating, not just on a settled one.
   *
   * A shift only stays within the scrollable range while we sit on a clone,
   * which is exactly when it is wanted: mid-deck positions are left alone.
   */
  const alignToLogicalPage = useCallback(() => {
    const el = scrollRef.current;
    if (!cloned || !el || draggingRef.current) {
      return;
    }
    const horizontal = orientation === 'horizontal';
    const pageSize = getPageSize();
    const cycle = pageCount * pageSize;
    const scroll = horizontal ? el.scrollLeft : el.scrollTop;
    const maxScroll = horizontal
      ? el.scrollWidth - el.clientWidth
      : el.scrollHeight - el.clientHeight;
    const drift = scroll - (currentPageRef.current + leadUnits) * pageSize;

    let aligned: number | null = null;
    if (drift > cycle / 2 && scroll - cycle >= -1) {
      aligned = scroll - cycle;
    } else if (drift < -cycle / 2 && scroll + cycle <= maxScroll + 1) {
      aligned = scroll + cycle;
    }
    if (aligned === null) {
      return;
    }

    const offset = Math.max(0, Math.min(aligned, maxScroll));
    suppressScrollFeedback(80);
    if (horizontal) {
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
      // Start from the cycle that makes this scroll travel the intended way:
      // interrupting a wrap mid-flight would otherwise rewind across the deck.
      alignToLogicalPage();
      const motion = behavior === 'smooth' && prefersReducedMotion() ? 'auto' : behavior;
      suppressScrollFeedback(motion === 'smooth' ? 400 : 50);

      const offset = getPageSize() * unit;
      if (orientation === 'horizontal') {
        el.scrollTo({ left: offset, behavior: motion });
      } else {
        el.scrollTo({ top: offset, behavior: motion });
      }
    },
    [orientation, getPageSize, alignToLogicalPage, suppressScrollFeedback],
  );

  const scrollToPage = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') =>
      scrollToUnit(index + leadUnits, behavior),
    [scrollToUnit, leadUnits],
  );

  /**
   * Commit a page as the current one without moving the scroll position.
   * A no-op when we are already there: the scroll listener runs on every frame
   * of a swipe, and each of those frames would otherwise be an `onPageChanged`
   * call carrying the page the consumer already knows about.
   */
  const commitPage = useCallback(
    (index: number) => {
      if (index === currentPageRef.current) {
        return;
      }
      currentPageRef.current = index;
      if (!isControlled) {
        setInternalPage(index);
      }
      onPageChangedRef.current?.(index);
    },
    [isControlled],
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
      // alignToLogicalPage rewinds onto the real one once scrolling stops.
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
      if (cloned) {
        // Realign once scrolling has actually stopped. A fixed delay would
        // sometimes fire mid-animation and cut the smooth scroll short, which
        // reads as the carousel snapping back.
        window.clearTimeout(loopFixTimerRef.current);
        loopFixTimerRef.current = window.setTimeout(alignToLogicalPage, 120);
      }
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
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [orientation, pageCount, cloned, leadUnits, commitPage, alignToLogicalPage, getPageSize]);

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        goToPage(e.key === 'Home' ? 0 : pageCount - 1);
        return;
      }

      const isForward =
        orientation === 'horizontal' ? e.key === 'ArrowRight' : e.key === 'ArrowDown';
      const isBack = orientation === 'horizontal' ? e.key === 'ArrowLeft' : e.key === 'ArrowUp';

      if (!isForward && !isBack) {
        return;
      }
      e.preventDefault();
      navigate(isForward ? 1 : -1);
    },
    [orientation, navigate, goToPage, pageCount],
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
      // alignToLogicalPage rewinds behind the scenes.
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

  // Auto-play: advance one slide every `interval` ms, pausing on hover, keyboard
  // focus, drag, a backgrounded tab, or the pause button.
  useEffect(() => {
    if (!autoPlay || !isPlaying || interval <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      if (draggingRef.current || isHoveringRef.current || isFocusedRef.current) {
        return;
      }
      // A backgrounded tab throttles the interval rather than stopping it, so
      // the carousel would otherwise race through the deck unseen.
      if (typeof document !== 'undefined' && document.hidden) {
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
  }, [autoPlay, isPlaying, interval, wraps, pageCount, navigate]);

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
  // `pageCount` is floored at 1, so an empty carousel would otherwise get a
  // lone dot standing for a page that holds nothing.
  const showIndicator = (indicator === 'dots' || indicator === 'lines') && slideCount > 0;
  const isSide = indicatorPosition === 'left' || indicatorPosition === 'right';
  // A single page has nowhere to go — don't render dead arrows.
  const showArrows = arrows && pageCount > 1;
  // WCAG 2.2.2: content that moves on its own needs a control to stop it. A
  // single page never moves, so it needs no button either.
  const showPlayPause = autoPlay && autoPlayControl && pageCount > 1;
  // Both the arrows and the play/pause button are overlaid on the track, so
  // either one calls for the viewport that positions them.
  const hasOverlay = showArrows || showPlayPause;
  // Anything but a bare scroll container needs a host for `className`/`style`/rest props.
  const isWrapped = showIndicator || hasOverlay;

  /**
   * Auto-play pauses while the pointer is over the carousel or the keyboard is
   * inside it. Both live on the outermost element so that the arrows, the
   * indicator and the pause button count as "over the carousel" too — hovering
   * an arrow used to resume the rotation you were reaching for.
   */
  const rootPauseProps = autoPlay
    ? {
        onMouseEnter: () => {
          isHoveringRef.current = true;
        },
        onMouseLeave: () => {
          isHoveringRef.current = false;
        },
        // React's onFocus/onBlur are focusin/focusout, so they see descendants.
        onFocus: () => {
          isFocusedRef.current = true;
        },
        onBlur: () => {
          isFocusedRef.current = false;
        },
      }
    : undefined;

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
  // `index` is the slide's own position (null for clones, which stay out of the
  // a11y tree); `source` is the real slide it renders, clone or not.
  const physicalSlides: {
    node: ReactNode;
    key: string;
    index: number | null;
    source: number;
  }[] = cloned
    ? [
        ...Array.from({ length: vSlides }, (_, k) => {
          const source = ((pageCount - 1) * vSlides + k) % slideCount;
          return { node: childArray[source], key: `lead-${k}`, index: null, source };
        }),
        ...childArray.map((node, index) => ({
          node,
          key: keyOf(node, index),
          index,
          source: index,
        })),
        ...Array.from({ length: trailingClones }, (_, k) => ({
          node: childArray[k % slideCount],
          key: `trail-${k}`,
          index: null,
          source: k % slideCount,
        })),
      ]
    : childArray.map((node, index) => ({
        node,
        key: keyOf(node, index),
        index,
        source: index,
      }));

  // `focusActiveSlides`: shrink everything outside the current group.
  const inactiveScale =
    focusActiveSlides === true
      ? 0.8
      : typeof focusActiveSlides === 'number'
        ? focusActiveSlides
        : 1;
  const scalesSlides = inactiveScale !== 1;
  const activeFrom = currentPage * vSlides;
  const activePhysicalFrom = (currentPage + leadUnits) * vSlides;
  // A slide counts as active either as itself or as the clone standing in for it
  // — the clone is what you are looking at mid-wrap, and it must not pop.
  const isActiveSlide = (physical: number, source: number) =>
    (source >= activeFrom && source < activeFrom + vSlides) ||
    (physical >= activePhysicalFrom && physical < activePhysicalFrom + vSlides);

  const scrollContainer = (
    <div
      ref={scrollRef}
      role="region"
      // `aria-roledescription` is only honoured on a named element, and an
      // unnamed region is dropped from the landmark tree outright.
      aria-label={label}
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
        ...(hasOverlay ? undefined : flexFill),
      }}
      {...(isWrapped ? undefined : rootPauseProps)}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      {...(isWrapped ? {} : props)}
    >
      {physicalSlides.map(({ node, key, index, source }, i) => (
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
                'aria-label': slideLabel(index, slideCount),
              })}
          style={{
            ...(slideFlexBasis ? { flex: `0 0 ${slideFlexBasis}` } : undefined),
            // Only the first slide of each group is a snap target; intermediate
            // slides would cause the carousel to stop mid-group.
            ...(vSlides > 1 && i % vSlides !== 0 ? { scrollSnapAlign: 'none' } : undefined),
          }}
        >
          {/* The scale lives on an inner element on purpose: a scroll snap area
              is the *transformed* border box, so scaling the slide itself would
              shift where the carousel comes to rest by half the size it lost. */}
          {scalesSlides ? (
            <div
              className={styles.slideScale}
              style={
                isActiveSlide(i, source) ? undefined : { transform: `scale(${inactiveScale})` }
              }
            >
              {node}
            </div>
          ) : (
            node
          )}
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

  const playPauseButton = (
    <button
      type="button"
      className={styles.playPause}
      aria-label={isPlaying ? pauseLabel : playLabel}
      onClick={() => {
        // An explicit press outranks the hover and focus pauses: the pointer and
        // the keyboard are sitting on this button precisely because you just
        // asked the carousel to move, so leaving those flags set would make the
        // resume button look dead.
        isHoveringRef.current = false;
        isFocusedRef.current = false;
        setIsPlaying((playing) => !playing);
      }}
    >
      <PlayPauseGlyph playing={isPlaying} />
    </button>
  );

  // The overlays are absolutely positioned against this viewport, so they stay
  // pinned to the visible edges instead of scrolling away with the track.
  const content = hasOverlay ? (
    <div
      className={[
        styles.viewport,
        isHorizontal ? styles.viewportHorizontal : styles.viewportVertical,
        showIndicator ? null : className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...(showIndicator ? undefined : style), ...flexFill }}
      {...(showIndicator ? undefined : rootPauseProps)}
      {...(showIndicator ? {} : props)}
    >
      {scrollContainer}
      {showArrows && renderArrow('prev')}
      {showArrows && renderArrow('next')}
      {showPlayPause && playPauseButton}
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

  const indicatorProps = {
    pages: pageCount,
    currentPage,
    onPageSelected: goToPage,
    label: indicatorLabel,
    pageLabel,
    style: indicatorStyle,
  };

  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex',
        flexDirection: INDICATOR_FLEX_DIR[indicatorPosition],
      }}
      {...rootPauseProps}
      {...props}
    >
      {content}
      {indicator === 'dots' && <CarouselIndicatorDots {...indicatorProps} />}
      {indicator === 'lines' && <CarouselIndicatorLines {...indicatorProps} />}
    </div>
  );
};

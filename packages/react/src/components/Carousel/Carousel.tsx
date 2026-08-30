import { usePrefersReducedMotion } from '@gnome-ui/hooks';
import {
  Children,
  type CSSProperties,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { useDir } from '@/components/GnomeProvider/GnomeContext';
import { VisuallyHidden } from '@/components/VisuallyHidden';
import { bucketForWidth, type ResponsiveValue, resolveResponsive } from '@/hooks/useBreakpoint';

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
const defaultStatusLabel = (index: number, total: number) => `Page ${index + 1} of ${total}`;

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
  /**
   * Axis the pages are laid out along. `'vertical'` stacks them, for an
   * indicator that sits beside the carousel rather than under it — which is
   * what `Carousel` passes when `indicatorPosition` is `'left'` or `'right'`.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
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
  orientation = 'horizontal',
  className,
  ...props
}: CarouselIndicatorDotsProps) => {
  return (
    // Not a `tablist`: there are no tabpanels to control, and the role would
    // promise roving-tabindex arrow navigation that a page picker does not have.
    <div
      className={[
        styles.indicatorDots,
        orientation === 'vertical' ? styles.indicatorVertical : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
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
  /**
   * Axis the pages are laid out along. `'vertical'` stacks them, for an
   * indicator that sits beside the carousel rather than under it — which is
   * what `Carousel` passes when `indicatorPosition` is `'left'` or `'right'`.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
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
  orientation = 'horizontal',
  className,
  ...props
}: CarouselIndicatorLinesProps) => {
  return (
    // Not a `tablist`: there are no tabpanels to control, and the role would
    // promise roving-tabindex arrow navigation that a page picker does not have.
    <div
      className={[
        styles.indicatorLines,
        orientation === 'vertical' ? styles.indicatorVertical : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
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

/**
 * Imperative handle for `Carousel`, reached through `ref`.
 *
 * Every method routes through the same internals as the arrows and the
 * indicator, so wrapping, cloned-page travel, reduced motion and the
 * controlled-mode contract all behave identically however the move was started.
 * The readable members are live getters, correct on the line after the call
 * that changed them rather than after the next render.
 */
export interface CarouselHandle {
  /** Advance one page. Wraps when `loop` or `infinite` is on. */
  next: () => void;
  /** Go back one page. Wraps when `loop` or `infinite` is on. */
  previous: () => void;
  /** Jump to a page index. Clamped into range — it never wraps. */
  goTo: (page: number, options?: { animate?: boolean }) => void;
  /**
   * Jump to the page holding a given slide, counting slides the way
   * `slideLabel` does. With `visibleSlides` above 1 this is not the page index.
   */
  goToSlide: (slide: number, options?: { animate?: boolean }) => void;
  /** Move keyboard focus to the track. */
  focus: () => void;
  /** Start the `autoPlay` rotation, exactly as the play button does. */
  play: () => void;
  /** Stop the `autoPlay` rotation, exactly as the pause button does. */
  pause: () => void;
  /** Current page index. */
  readonly page: number;
  /** Total pages: `ceil(slides / visibleSlides)`, floored at 1. */
  readonly pageCount: number;
  /** Whether the rotation is running — always `false` without `autoPlay`. */
  readonly isPlaying: boolean;
  /** The scrollable track, for measuring or positioning. `null` before mount. */
  readonly element: HTMLDivElement | null;
}

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Imperative handle — see `CarouselHandle`. */
  ref?: Ref<CarouselHandle>;
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
   *
   * Accepts a breakpoint map, resolved like `visibleSlides`.
   * @default 0
   */
  peek?: ResponsiveValue<number | string>;
  /**
   * Number of slides visible at once (integer ≥ 1). Navigation advances one
   * full group at a time, and the indicator shows one dot/line per group.
   *
   * Accepts a breakpoint map keyed by the GNOME breakpoints, which are
   * max-widths — so it reads like stacked media queries and the narrowest
   * matching entry wins:
   *
   * ```tsx
   * <Carousel visibleSlides={{ base: 3, wide: 2, narrow: 1 }} />
   * ```
   *
   * The carousel keeps the leading slide on screen across a change, so the page
   * index shifts to wherever that slide now lives.
   * @default 1
   */
  visibleSlides?: ResponsiveValue<number>;
  /** Called whenever the visible page changes — once per actual change. */
  onPageChanged?: (index: number) => void;
  /**
   * Controlled current page index. The carousel reports where the user moved it
   * through `onPageChanged`, but only ever renders the page you pass — set this
   * from `onPageChanged` or the indicator will disagree with the track.
   *
   * When omitted the carousel manages page state internally; use `defaultPage`
   * to pick the page it starts on.
   */
  page?: number;
  /**
   * Page the carousel starts on when uncontrolled. Clamped into range, and
   * ignored once `page` is passed.
   * @default 0
   */
  defaultPage?: number;
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
   * The live-region announcement made whenever the page changes. Silenced
   * while an `autoPlay` rotation is actually running.
   * @default `Page ${index + 1} of ${total}`
   */
  statusLabel?: (index: number, total: number) => string;
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
  ref,
  orientation = 'horizontal',
  spacing = 0,
  loop = false,
  infinite = false,
  peek = 0,
  focusActiveSlides = false,
  visibleSlides = 1,
  onPageChanged,
  page: controlledPage,
  defaultPage = 0,
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
  statusLabel = defaultStatusLabel,
  pauseLabel = 'Pause automatic slide rotation',
  playLabel = 'Resume automatic slide rotation',
  previousLabel = 'Previous slide',
  nextLabel = 'Next slide',
  className,
  style,
  ...props
}: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Breakpoints resolve against the carousel's own width, not the window's: a
  // carousel in a sidebar has to adapt to the space it was given. That is the
  // `AdwBreakpointBin` pattern.
  //
  // Measured border box, not content box — which is why `useElementSize` is not
  // the hook for this. `peek` is inset as padding on this very element, so a
  // content-box reading would shrink with it, and a width sitting near a
  // threshold could flip the bucket, change the peek, and flip back forever.
  const [trackWidth, setTrackWidth] = useState(0);
  const bucket = bucketForWidth(trackWidth);
  const visible = resolveResponsive(visibleSlides, bucket, 1);
  const peekAt = resolveResponsive(peek, bucket, 0);
  const vSlides = Math.max(1, Math.floor(visible)); // enforce integer
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
  const isHorizontal = orientation === 'horizontal';
  const axis = isHorizontal ? 'width' : 'height';
  // Clamped, so an out-of-range `defaultPage` cannot strand the carousel on a
  // page that has nothing behind it.
  const [internalPage, setInternalPage] = useState(() =>
    Math.max(0, Math.min(Math.floor(defaultPage), pageCount - 1)),
  );
  // Direction has two possible sources and the component honours both: a
  // `GnomeProvider dir` (context only — the provider does not write the
  // attribute) and a plain `dir="rtl"` anywhere up the DOM tree.
  const contextDir = useDir();
  const [domRtl, setDomRtl] = useState(false);
  const isRtl = contextDir === 'rtl' || domRtl;
  const reducedMotion = usePrefersReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  // The focus pause itself runs off a ref; this mirrors it into state purely so
  // the live region can un-mute. A carousel that is rotating stays silent, but
  // a keyboard user inside it has stopped the rotation and wants to be told
  // where their arrow keys landed.
  const [keyboardInside, setKeyboardInside] = useState(false);
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
  // Live snapshots for the imperative handle's getters, so a read taken on the
  // line after `next()` is already right instead of waiting for a render.
  const pageCountRef = useRef(pageCount);
  const playingRef = useRef(autoPlay);
  useEffect(() => {
    currentPageRef.current = currentPage;
    onPageChangedRef.current = onPageChanged;
    pageCountRef.current = pageCount;
    playingRef.current = autoPlay && isPlaying;
  });

  // CSS `direction` fires no event of its own, so it is read off the DOM on
  // mount and re-read whenever a `dir` attribute changes anywhere up the tree.
  // The attribute filter keeps this quiet: nothing else wakes it, and the
  // callback only ever reads.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const read = () => {
      const rtl = getComputedStyle(el).direction === 'rtl';
      setDomRtl((was) => (was === rtl ? was : rtl));
    };
    read();

    if (typeof MutationObserver === 'undefined') {
      return;
    }
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  /**
   * A right-to-left horizontal scroller starts at its right edge: `scrollLeft`
   * is 0 on page 0 and counts *down* into negatives as you page forward.
   * Everything below works in logical coordinates instead — 0 at page 0, growing
   * forward, in both directions — and these four helpers are the only places
   * that touch the DOM's own numbers. Vertical carousels are unaffected.
   */
  const dirSign = isHorizontal && isRtl ? -1 : 1;

  const readScroll = useCallback(
    (el: HTMLElement) => (isHorizontal ? el.scrollLeft * dirSign : el.scrollTop),
    [isHorizontal, dirSign],
  );

  const readMaxScroll = useCallback(
    (el: HTMLElement) =>
      isHorizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight,
    [isHorizontal],
  );

  /** Instant, assignment-based — the drag loop runs this on every pointer move. */
  const setScroll = useCallback(
    (el: HTMLElement, offset: number) => {
      if (isHorizontal) {
        el.scrollLeft = offset * dirSign;
      } else {
        el.scrollTop = offset;
      }
    },
    [isHorizontal, dirSign],
  );

  const animateScroll = useCallback(
    (el: HTMLElement, offset: number, behavior: ScrollBehavior) => {
      if (isHorizontal) {
        el.scrollTo({ left: offset * dirSign, behavior });
      } else {
        el.scrollTo({ top: offset, behavior });
      }
    },
    [isHorizontal, dirSign],
  );

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
      : isHorizontal
        ? el.clientWidth
        : el.clientHeight;
    const size = vSlides * (slideSize + spacing);
    return size > 0 ? size : 1;
  }, [isHorizontal, spacing, vSlides, axis]);

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
    const pageSize = getPageSize();
    const cycle = pageCount * pageSize;
    const scroll = readScroll(el);
    const maxScroll = readMaxScroll(el);
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
    animateScroll(el, offset, 'auto');
  }, [
    cloned,
    leadUnits,
    pageCount,
    getPageSize,
    readScroll,
    readMaxScroll,
    animateScroll,
    suppressScrollFeedback,
  ]);

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
      // A `behavior: 'smooth'` passed to `scrollTo` wins over the stylesheet's
      // `scroll-behavior`, so reduced motion has to be honoured here, not in CSS.
      const motion = behavior === 'smooth' && reducedMotion ? 'auto' : behavior;
      suppressScrollFeedback(motion === 'smooth' ? 400 : 50);

      animateScroll(el, getPageSize() * unit, motion);
    },
    [reducedMotion, getPageSize, animateScroll, alignToLogicalPage, suppressScrollFeedback],
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
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      scrollToPage(index, behavior);
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
      const idx = Math.round(readScroll(el) / pageSize) - leadUnits;
      const settled = cloned
        ? ((idx % pageCount) + pageCount) % pageCount
        : Math.max(0, Math.min(idx, pageCount - 1));
      commitPage(settled);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [pageCount, cloned, leadUnits, commitPage, alignToLogicalPage, getPageSize, readScroll]);

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        goToPage(e.key === 'Home' ? 0 : pageCount - 1);
        return;
      }

      // Arrow keys follow what the eye sees, so in RTL the *left* arrow is the
      // one that moves forward through the deck.
      const forwardKey = isHorizontal ? (isRtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
      const backKey = isHorizontal ? (isRtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
      const isForward = e.key === forwardKey;
      const isBack = e.key === backKey;

      if (!isForward && !isBack) {
        return;
      }
      e.preventDefault();
      navigate(isForward ? 1 : -1);
    },
    [isHorizontal, isRtl, navigate, goToPage, pageCount],
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
        pos: isHorizontal ? e.clientX : e.clientY,
        scroll: readScroll(el),
        time: Date.now(),
      };
    },
    [isHorizontal, readScroll],
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

      const pos = isHorizontal ? e.clientX : e.clientY;
      // Signed into logical space: in RTL the finger travels right to move
      // forward through the deck.
      const delta = (dragStartRef.current.pos - pos) * dirSign;

      if (Math.abs(delta) > 4) {
        hasDraggedRef.current = true;
      }

      // Apply boundary resistance: dampen movement past first/last slide
      const maxScroll = readMaxScroll(el);
      let newScroll = dragStartRef.current.scroll + delta;

      if (newScroll < 0) {
        newScroll *= 0.3;
      } else if (newScroll > maxScroll) {
        newScroll = maxScroll + (newScroll - maxScroll) * 0.3;
      }

      setScroll(el, newScroll);
    },
    [isHorizontal, dirSign, readMaxScroll, setScroll],
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
      const pos = isCancel ? dragStartRef.current.pos : isHorizontal ? e.clientX : e.clientY;

      const delta = (dragStartRef.current.pos - pos) * dirSign;
      const elapsed = Math.max(Date.now() - dragStartRef.current.time, 1);
      const velocity = isCancel ? 0 : delta / elapsed; // px/ms, positive = forward
      const pageSize = getPageSize();
      const scroll = readScroll(el);
      const maxScroll = readMaxScroll(el);

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
    [
      isHorizontal,
      dirSign,
      getPageSize,
      readScroll,
      readMaxScroll,
      wraps,
      cloned,
      leadUnits,
      pageCount,
      scrollToUnit,
      commitPage,
    ],
  );

  /**
   * An explicit play or pause outranks the hover and focus pauses: the pointer
   * and the keyboard are sitting on the button precisely because you just asked
   * the carousel to move, so leaving those flags set would make the resume
   * button look dead.
   */
  const setPlaying = useCallback(
    (playing: boolean) => {
      isHoveringRef.current = false;
      isFocusedRef.current = false;
      // Written here as well as in the sync effect, so `handle.isPlaying` does
      // not lag a render behind `handle.pause()`.
      playingRef.current = autoPlay && playing;
      setIsPlaying(playing);
    },
    [autoPlay],
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

  // A breakpoint change regroups the deck under us: the page index that meant
  // "slides 3 and 4" now means something else, and at 3-per-page there may not
  // even be a page 4 any more. Follow the slide that was leading the view rather
  // than the index, so what the reader was looking at stays on screen.
  const prevVSlidesRef = useRef(vSlides);
  useEffect(() => {
    if (prevVSlidesRef.current === vSlides) {
      return;
    }
    const leadingSlide = currentPageRef.current * prevVSlidesRef.current;
    prevVSlidesRef.current = vSlides;

    const target = Math.max(0, Math.min(Math.floor(leadingSlide / vSlides), pageCount - 1));
    commitPage(target);
    // Unconditional: the group size changed, so the offset of that page did too,
    // even when its index happens to be the one we were already on.
    scrollToPage(target, 'auto');
  }, [vSlides, pageCount, commitPage, scrollToPage]);

  // Page offsets are pixel measurements, and with clones page 0 does not sit at
  // scroll 0 — so put the current page back in place on mount and on resize.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const measure = () => {
      const border = isHorizontal ? el.offsetWidth : el.offsetHeight;
      setTrackWidth((was) => (was === border ? was : border));
    };

    const reposition = () => {
      measure();
      // Skip when already in place, so the common case never mutes the scroll
      // listener or fights a scroll in progress.
      const target = (currentPageRef.current + leadUnits) * getPageSize();
      if (Math.abs(readScroll(el) - target) < 1) {
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
  }, [scrollToPage, getPageSize, readScroll, leadUnits, isHorizontal]);

  useImperativeHandle(ref, (): CarouselHandle => {
    const clampPage = (index: number) =>
      Math.max(0, Math.min(Math.floor(index), pageCountRef.current - 1));

    return {
      // Straight through `navigate`, which is what the arrows call — the
      // wrapping and the travel onto cloned pages come along with it.
      next: () => navigate(1),
      previous: () => navigate(-1),
      goTo: (index, options) =>
        goToPage(clampPage(index), options?.animate === false ? 'auto' : 'smooth'),
      goToSlide: (slide, options) => {
        const bounded = Math.max(0, Math.min(Math.floor(slide), slideCount - 1));
        goToPage(clampPage(bounded / vSlides), options?.animate === false ? 'auto' : 'smooth');
      },
      focus: () => scrollRef.current?.focus(),
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      get page() {
        return currentPageRef.current;
      },
      get pageCount() {
        return pageCountRef.current;
      },
      get isPlaying() {
        return playingRef.current;
      },
      get element() {
        return scrollRef.current;
      },
    };
  }, [navigate, goToPage, setPlaying, slideCount, vSlides]);

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

  // `pageCount` is floored at 1, so an empty carousel would otherwise get a
  // lone dot standing for a page that holds nothing.
  const showIndicator = (indicator === 'dots' || indicator === 'lines') && slideCount > 0;
  const isSide = indicatorPosition === 'left' || indicatorPosition === 'right';
  // A single page has nowhere to go — don't render dead arrows.
  const showArrows = arrows && pageCount > 1;
  // Nothing to announce on a deck that cannot move — and no live region on an
  // empty one, whose only child would otherwise be measured as a slide.
  const showStatus = pageCount > 1;
  // Announcing every automatic transition would make the page unusable, so the
  // region stays quiet while the rotation actually runs.
  const isRotating = autoPlay && isPlaying && !keyboardInside;
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
          setKeyboardInside(true);
        },
        onBlur: () => {
          isFocusedRef.current = false;
          setKeyboardInside(false);
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
    peekAt === 0 || peekAt === ''
      ? undefined
      : typeof peekAt === 'number'
        ? `${peekAt + spacing}px`
        : spacing
          ? `calc(${peekAt} + ${spacing}px)`
          : peekAt;

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

  /**
   * Both cues for a page change — the dot moving, the track scrolling — are
   * invisible to a screen reader, since every slide sits in the DOM either way.
   *
   * It is a sibling of the track rather than a child: the track's children are
   * its slides, and both `getPageSize` and the slide arithmetic read them that
   * way. Being `position: absolute` it is out of flow, so it never becomes a
   * flex item of whatever holds the carousel and adds nothing to any scroll
   * extent.
   */
  const status = showStatus ? (
    <VisuallyHidden role="status" aria-live={isRotating ? 'off' : 'polite'}>
      {statusLabel(currentPage, pageCount)}
    </VisuallyHidden>
  ) : null;

  const renderArrow = (dir: 'prev' | 'next') => {
    const isPrev = dir === 'prev';
    const disabled = !wraps && (isPrev ? currentPage <= 0 : currentPage >= pageCount - 1);

    return (
      <button
        type="button"
        className={[styles.arrow, isPrev ? styles.arrowPrev : styles.arrowNext].join(' ')}
        aria-label={isPrev ? previousLabel : nextLabel}
        // `aria-disabled`, not `disabled`: a real `disabled` drops the button
        // out of the tab order the instant you page onto the last slide, so the
        // keyboard focus you were clicking with falls to the body. The button
        // stays focusable and the press is ignored instead.
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) {
            navigate(isPrev ? -1 : 1);
          }
        }}
      >
        <ArrowChevron
          direction={isHorizontal ? (isPrev === !isRtl ? 'left' : 'right') : isPrev ? 'up' : 'down'}
        />
      </button>
    );
  };

  const playPauseButton = (
    <button
      type="button"
      className={styles.playPause}
      aria-label={isPlaying ? pauseLabel : playLabel}
      onClick={() => setPlaying(!isPlaying)}
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
    return (
      <>
        {content}
        {status}
      </>
    );
  }

  const indicatorProps = {
    pages: pageCount,
    currentPage,
    onPageSelected: goToPage,
    label: indicatorLabel,
    pageLabel,
    orientation: isSide ? ('vertical' as const) : ('horizontal' as const),
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
      {status}
    </div>
  );
};

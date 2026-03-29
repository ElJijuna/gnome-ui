import {
  useRef,
  useState,
  useEffect,
  useCallback,
  Children,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Carousel.module.css";

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
export function CarouselIndicatorDots({
  pages,
  currentPage,
  onPageSelected,
  className,
  ...props
}: CarouselIndicatorDotsProps) {
  return (
    <div
      className={[styles.indicatorDots, className].filter(Boolean).join(" ")}
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
            .join(" ")}
          onClick={() => onPageSelected?.(i)}
        />
      ))}
    </div>
  );
}

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
export function CarouselIndicatorLines({
  pages,
  currentPage,
  onPageSelected,
  className,
  ...props
}: CarouselIndicatorLinesProps) {
  return (
    <div
      className={[styles.indicatorLines, className].filter(Boolean).join(" ")}
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
            .join(" ")}
          onClick={() => onPageSelected?.(i)}
        />
      ))}
    </div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /**
   * Scroll orientation.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
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
 * page transitions. Supports keyboard navigation (arrow keys) and touch/mouse
 * drag via the browser's native scroll handling.
 *
 * Pair with `CarouselIndicatorDots` or `CarouselIndicatorLines` for pagination UI.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Carousel.html
 */
export function Carousel({
  children,
  orientation = "horizontal",
  spacing = 0,
  loop = false,
  onPageChanged,
  page: controlledPage,
  className,
  ...props
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageCount = Children.count(children);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;

  // Scroll to the controlled page when it changes externally
  useEffect(() => {
    if (!isControlled) return;
    scrollToPage(controlledPage, "smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledPage]);

  const scrollToPage = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const el = scrollRef.current;
      if (!el) return;
      if (orientation === "horizontal") {
        el.scrollTo({ left: el.clientWidth * index, behavior });
      } else {
        el.scrollTo({ top: el.clientHeight * index, behavior });
      }
    },
    [orientation]
  );

  // Detect page changes via IntersectionObserver on each child
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const pages = Array.from(el.children) as HTMLElement[];
      const size = orientation === "horizontal" ? el.clientWidth : el.clientHeight;
      const scroll = orientation === "horizontal" ? el.scrollLeft : el.scrollTop;
      const idx = Math.round(scroll / (size || 1));
      const clamped = Math.max(0, Math.min(idx, pageCount - 1));
      if (!isControlled) setInternalPage(clamped);
      onPageChanged?.(clamped);
      void pages; // suppress lint
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [orientation, pageCount, isControlled, onPageChanged]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isForward =
        orientation === "horizontal" ? e.key === "ArrowRight" : e.key === "ArrowDown";
      const isBack =
        orientation === "horizontal" ? e.key === "ArrowLeft" : e.key === "ArrowUp";

      if (isForward) {
        e.preventDefault();
        const next = loop
          ? (currentPage + 1) % pageCount
          : Math.min(currentPage + 1, pageCount - 1);
        scrollToPage(next);
        if (!isControlled) setInternalPage(next);
        onPageChanged?.(next);
      } else if (isBack) {
        e.preventDefault();
        const prev = loop
          ? (currentPage - 1 + pageCount) % pageCount
          : Math.max(currentPage - 1, 0);
        scrollToPage(prev);
        if (!isControlled) setInternalPage(prev);
        onPageChanged?.(prev);
      }
    },
    [currentPage, pageCount, loop, orientation, scrollToPage, isControlled, onPageChanged]
  );

  const isHorizontal = orientation === "horizontal";

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      className={[
        styles.carousel,
        isHorizontal ? styles.horizontal : styles.vertical,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        isHorizontal
          ? { columnGap: spacing || undefined }
          : { rowGap: spacing || undefined }
      }
      onKeyDown={handleKeyDown}
      {...props}
    >
      {Children.map(children, (child, i) => (
        <div
          key={i}
          className={styles.slide}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${pageCount}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

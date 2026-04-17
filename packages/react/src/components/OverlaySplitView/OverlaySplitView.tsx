import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import styles from "./OverlaySplitView.module.css";

export interface OverlaySplitViewProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * The sidebar pane.
   * On wide screens it sits beside the content.
   * On narrow screens it slides over the content as an overlay.
   */
  sidebar: ReactNode;
  /** The main content pane — always visible. */
  content: ReactNode;
  /**
   * Whether the sidebar is shown.
   * - Wide screens: always both visible; this prop is ignored.
   * - Narrow screens (≤ 400 px): controls whether the overlay is open.
   */
  showSidebar?: boolean;
  /**
   * Called when the user clicks the backdrop (narrow screens only).
   * Use this to set `showSidebar` to false.
   */
  onClose?: () => void;
  /**
   * Which side the sidebar appears on. Defaults to `"start"` (left in LTR).
   */
  sidebarPosition?: "start" | "end";
  /**
   * Minimum sidebar width in px. Defaults to `180`.
   */
  minSidebarWidth?: number;
  /**
   * Maximum sidebar width in px. Defaults to `280`.
   */
  maxSidebarWidth?: number;
  /**
   * Fraction of total width given to the sidebar. Defaults to `0.25`.
   */
  sidebarWidthFraction?: number;
}

/**
 * Sidebar + content layout where the sidebar becomes a slide-over overlay
 * on narrow screens, mirroring the Adwaita `AdwOverlaySplitView` pattern.
 *
 * On **wide** screens (> 400 px) sidebar and content are side-by-side.
 * On **narrow** screens (≤ 400 px) the content fills the full width and
 * the sidebar slides in as an overlay when `showSidebar` is true,
 * with a translucent backdrop behind it.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <OverlaySplitView
 *   showSidebar={open}
 *   onClose={() => setOpen(false)}
 *   sidebar={<Nav />}
 *   content={<MainContent onMenuClick={() => setOpen(true)} />}
 * />
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.OverlaySplitView.html
 */
export function OverlaySplitView({
  sidebar,
  content,
  showSidebar = false,
  onClose,
  sidebarPosition = "start",
  minSidebarWidth = 180,
  maxSidebarWidth = 280,
  sidebarWidthFraction = 0.25,
  className,
  style,
  ...props
}: OverlaySplitViewProps) {
  const { isNarrow } = useBreakpoint();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sidebarWidth =
    `clamp(${minSidebarWidth}px, ${sidebarWidthFraction * 100}%, ${maxSidebarWidth}px)`;

  // Close on Escape in overlay mode
  useEffect(() => {
    if (!isNarrow || !showSidebar) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isNarrow, showSidebar, onClose]);

  // Trap focus inside sidebar when open in overlay mode
  useEffect(() => {
    if (!isNarrow || !showSidebar) return;
    const first = sidebarRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
  }, [isNarrow, showSidebar]);

  const isEnd = sidebarPosition === "end";

  // Swipe-to-dismiss: drag the sidebar in the close direction to trigger onClose
  useEffect(() => {
    if (!isNarrow || !showSidebar) return;
    const el = sidebarRef.current;
    if (!el) return;

    let startX = 0;
    const THRESHOLD = 80;

    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd   = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const closeSwipe = isEnd ? dx > THRESHOLD : dx < -THRESHOLD;
      if (closeSwipe) onClose?.();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [isNarrow, showSidebar, isEnd, onClose]);

  return (
    <div
      className={[
        styles.root,
        isNarrow ? styles.narrow : styles.wide,
        isEnd ? styles.end : styles.start,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--sidebar-width": sidebarWidth, ...style } as React.CSSProperties}
      {...props}
    >
      {/* Backdrop — narrow mode only */}
      {isNarrow && (
        <div
          className={[styles.backdrop, showSidebar ? styles.backdropVisible : null]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={[
          styles.sidebar,
          isNarrow
            ? showSidebar ? styles.sidebarOpen : styles.sidebarClosed
            : null,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={isNarrow && !showSidebar}
      >
        {sidebar}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {content}
      </div>
    </div>
  );
}

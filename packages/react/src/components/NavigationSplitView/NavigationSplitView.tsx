import { type HTMLAttributes, type ReactNode } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import styles from "./NavigationSplitView.module.css";

export interface NavigationSplitViewProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * The sidebar / list pane (left side on wide screens).
   * On narrow screens this is the "list" view shown when `showContent` is false.
   */
  sidebar: ReactNode;
  /**
   * The detail / content pane (right side on wide screens).
   * On narrow screens this is the "detail" view shown when `showContent` is true.
   */
  content: ReactNode;
  /**
   * Controls which pane is visible on narrow screens (≤ 400 px).
   * - `false` (default) — show the sidebar list.
   * - `true`            — show the content detail.
   *
   * Has no effect on wide screens where both panes are visible simultaneously.
   */
  showContent?: boolean;
  /**
   * Minimum sidebar width in px. Defaults to `180`.
   */
  minSidebarWidth?: number;
  /**
   * Maximum sidebar width in px. Defaults to `280`.
   */
  maxSidebarWidth?: number;
  /**
   * Fraction of total width given to the sidebar (0–1). Defaults to `0.25`.
   */
  sidebarWidthFraction?: number;
}

/**
 * Two-pane sidebar + content layout following the Adwaita
 * `AdwNavigationSplitView` pattern.
 *
 * On **wide** screens (> 400 px) both panes are visible side-by-side.
 * On **narrow** screens (≤ 400 px) only one pane is shown at a time;
 * use `showContent` to switch between the sidebar list and the detail view.
 *
 * The sidebar width is constrained between `minSidebarWidth` and
 * `maxSidebarWidth`, gravitating toward `sidebarWidthFraction` of the total.
 *
 * @example
 * const [showContent, setShowContent] = useState(false);
 * <NavigationSplitView
 *   showContent={showContent}
 *   sidebar={<MailList onSelect={() => setShowContent(true)} />}
 *   content={<MailDetail onBack={() => setShowContent(false)} />}
 * />
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.NavigationSplitView.html
 */
export function NavigationSplitView({
  sidebar,
  content,
  showContent = false,
  minSidebarWidth = 180,
  maxSidebarWidth = 280,
  sidebarWidthFraction = 0.25,
  className,
  style,
  ...props
}: NavigationSplitViewProps) {
  const { isNarrow } = useBreakpoint();

  // CSS custom property drives the sidebar width clamp
  const sidebarWidth =
    `clamp(${minSidebarWidth}px, ${sidebarWidthFraction * 100}%, ${maxSidebarWidth}px)`;

  return (
    <div
      className={[
        styles.root,
        isNarrow ? styles.collapsed : styles.expanded,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--sidebar-width": sidebarWidth, ...style } as React.CSSProperties}
      {...props}
    >
      {/* Sidebar pane */}
      <div
        className={[
          styles.sidebar,
          isNarrow && showContent ? styles.paneHidden : styles.paneVisible,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={isNarrow && showContent}
      >
        {sidebar}
      </div>

      {/* Separator — only on wide screens */}
      {!isNarrow && <div className={styles.divider} aria-hidden="true" />}

      {/* Content pane */}
      <div
        className={[
          styles.contentPane,
          isNarrow && !showContent ? styles.paneHidden : styles.paneVisible,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={isNarrow && !showContent}
      >
        {content}
      </div>
    </div>
  );
}

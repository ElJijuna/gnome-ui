import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ToolbarView.module.css";

export interface ToolbarViewProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Bar(s) pinned to the top — typically a `HeaderBar` or `Toolbar`.
   * Multiple bars stack vertically.
   */
  topBar?: ReactNode;
  /**
   * Bar(s) pinned to the bottom — typically a `Toolbar` or `ViewSwitcherBar`.
   * Multiple bars stack vertically.
   */
  bottomBar?: ReactNode;
  /** Scrollable content area between the bars. */
  children?: ReactNode;
}

/**
 * Layout container that attaches bars at the top and/or bottom while
 * scrolling only the middle content.
 *
 * The top/bottom bars remain fixed; the inner content area gets
 * `overflow-y: auto` so it scrolls independently.
 *
 * Mirrors `AdwToolbarView`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ToolbarView.html
 */
export function ToolbarView({
  topBar,
  bottomBar,
  children,
  className,
  ...props
}: ToolbarViewProps) {
  return (
    <div
      className={[styles.toolbarView, className].filter(Boolean).join(" ")}
      {...props}
    >
      {topBar && <div className={styles.top}>{topBar}</div>}
      <div className={styles.content}>{children}</div>
      {bottomBar && <div className={styles.bottom}>{bottomBar}</div>}
    </div>
  );
}

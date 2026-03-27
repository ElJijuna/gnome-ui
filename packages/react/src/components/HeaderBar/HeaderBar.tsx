import type { HTMLAttributes, ReactNode } from "react";
import styles from "./HeaderBar.module.css";

export interface HeaderBarProps extends HTMLAttributes<HTMLElement> {
  /** Centered title. Pass a string or a custom element. */
  title?: ReactNode;
  /** Controls placed at the leading (left) edge — back button, menu, etc. */
  start?: ReactNode;
  /** Controls placed at the trailing (right) edge — actions, overflow menu, etc. */
  end?: ReactNode;
  /**
   * When true the header bar blends into the window chrome
   * (no bottom border, slightly transparent background).
   * Use for the topmost bar of a full-window layout.
   */
  flat?: boolean;
}

/**
 * Title bar with centered title and leading/trailing action slots.
 *
 * Mirrors the Adwaita `AdwHeaderBar` pattern. Use `flat` buttons
 * (`<Button variant="flat">`) inside the header bar per GNOME HIG.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.HeaderBar.html
 * @see https://developer.gnome.org/hig/patterns/containers/header-bars.html
 */
export function HeaderBar({
  title,
  start,
  end,
  flat = false,
  className,
  ...props
}: HeaderBarProps) {
  return (
    <header
      className={[styles.headerBar, flat ? styles.flat : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/* Leading slot */}
      <div className={styles.slot}>
        {start}
      </div>

      {/* Centered title */}
      <div className={styles.titleSlot} aria-live="polite">
        {typeof title === "string" ? (
          <span className={styles.title}>{title}</span>
        ) : (
          title
        )}
      </div>

      {/* Trailing slot */}
      <div className={[styles.slot, styles.slotEnd].filter(Boolean).join(" ")}>
        {end}
      </div>
    </header>
  );
}

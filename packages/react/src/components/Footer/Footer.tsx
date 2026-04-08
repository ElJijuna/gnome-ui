import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Footer.module.css";

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Content placed at the leading (left) edge — links, copyright, etc. */
  start?: ReactNode;
  /** Content placed at the trailing (right) edge — actions, links, etc. */
  end?: ReactNode;
  /** Center content or arbitrary children. */
  children?: ReactNode;
  /**
   * When true the footer has no top border.
   * Use when the footer is separated from content by another visual boundary.
   */
  flat?: boolean;
}

/**
 * Bottom bar with leading/trailing slots and optional center content.
 *
 * Mirrors the `HeaderBar` pattern at the bottom of a view or window.
 * Accepts plain text, links, and arbitrary ReactNode in each slot.
 *
 * @see https://developer.gnome.org/hig/patterns/containers/header-bars.html
 */
export function Footer({
  start,
  end,
  children,
  flat = false,
  className,
  ...props
}: FooterProps) {
  return (
    <footer
      className={[styles.footer, flat ? styles.flat : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className={styles.slot}>{start}</div>

      {children != null && (
        <div className={styles.center}>{children}</div>
      )}

      <div className={[styles.slot, styles.slotEnd].filter(Boolean).join(" ")}>
        {end}
      </div>
    </footer>
  );
}

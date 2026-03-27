import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "accent" | "success" | "warning" | "error" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual style. Defaults to `"accent"`.
   * - `accent`  — blue, for counts and highlights.
   * - `success` — green, for positive status.
   * - `warning` — yellow, for cautionary status.
   * - `error`   — red, for failures or urgent counts.
   * - `neutral` — gray, for inactive or secondary counts.
   */
  variant?: BadgeVariant;
  /**
   * When true, renders a small dot with no label — used for unread/online indicators.
   * The `children` are ignored in dot mode.
   */
  dot?: boolean;
  /** Number or short text to display. Keep to 1–3 characters. */
  children?: ReactNode;
  /**
   * When provided, the badge is absolutely positioned over this child element
   * at the top-right corner. The wrapper becomes `position: relative`.
   */
  anchor?: ReactNode;
}

/**
 * Counter or status indicator, optionally overlaid on another element.
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/badges.html
 */
export function Badge({
  variant = "accent",
  dot = false,
  children,
  anchor,
  className,
  ...props
}: BadgeProps) {
  const badgeEl = (
    <span
      className={[
        styles.badge,
        styles[variant],
        dot ? styles.dot : null,
        anchor ? styles.anchored : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {!dot && children}
    </span>
  );

  if (anchor) {
    return (
      <span className={styles.wrapper}>
        {anchor}
        {badgeEl}
      </span>
    );
  }

  return badgeEl;
}

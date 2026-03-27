import type { HTMLAttributes } from "react";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Size of the spinner. Defaults to `"md"`. */
  size?: SpinnerSize;
  /**
   * Accessible label announced by screen readers.
   * Defaults to `"Loading…"`. Set to `""` to silence if a sibling label is present.
   */
  label?: string;
}

/**
 * Indeterminate loading indicator following the Adwaita spinner style.
 *
 * Renders a spinning ring using a pure CSS animation that respects
 * `prefers-reduced-motion`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html
 */
export function Spinner({
  size = "md",
  label = "Loading\u2026",
  className,
  ...props
}: SpinnerProps) {
  const classes = [styles.spinner, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      role="status"
      aria-label={label || undefined}
      aria-hidden={label === "" ? true : undefined}
      className={classes}
      {...props}
    />
  );
}

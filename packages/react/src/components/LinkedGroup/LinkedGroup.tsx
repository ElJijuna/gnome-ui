import type { HTMLAttributes, ReactNode } from "react";
import styles from "./LinkedGroup.module.css";

export interface LinkedGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * Stack children vertically instead of horizontally.
   * Useful for stacked input or button groups.
   */
  vertical?: boolean;
}

/**
 * Renders children as a single visually-connected unit with no gap and
 * merged borders — the canonical GNOME pattern for button groups and
 * segmented inputs.
 *
 * Mirrors the libadwaita `.linked` style class.
 *
 * - First child gets left (or top) border radius.
 * - Last child gets right (or bottom) border radius.
 * - Adjacent borders are collapsed to a single pixel.
 * - Hover and focus bring the active child to the front via `z-index`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html#linked-style-class
 *
 * @example
 * <LinkedGroup>
 *   <Button>Cut</Button>
 *   <Button>Copy</Button>
 *   <Button>Paste</Button>
 * </LinkedGroup>
 */
export function LinkedGroup({
  children,
  vertical = false,
  className,
  ...props
}: LinkedGroupProps) {
  const classes = [
    styles.linked,
    vertical ? styles.vertical : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

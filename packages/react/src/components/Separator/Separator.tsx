import type { HTMLAttributes } from "react";
import styles from "./Separator.module.css";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  /** Direction of the dividing line. Defaults to `"horizontal"`. */
  orientation?: SeparatorOrientation;
}

/**
 * Thin dividing line that separates groups of content.
 *
 * Renders as `<hr>` (horizontal) or a `<div role="separator">` (vertical).
 * Color is driven entirely by design tokens and adapts to dark mode automatically.
 *
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export function Separator({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) {
  const classes = [
    styles.separator,
    orientation === "vertical" ? styles.vertical : styles.horizontal,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={classes}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      />
    );
  }

  return <hr className={classes} {...props} />;
}

import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Frame.module.css";

export interface FrameProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Simple bordered surface with border-radius but no background fill.
 *
 * Use to visually delimit a region without adding the elevated appearance
 * of a `Card`. Mirrors `GtkFrame` default styling and the libadwaita
 * `.frame` style class.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html#frame-style-class
 */
export function Frame({ children, className, ...props }: FrameProps) {
  return (
    <div
      className={[styles.frame, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

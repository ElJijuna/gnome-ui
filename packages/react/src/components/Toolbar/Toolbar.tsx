import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Toolbar.module.css";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Horizontal action bar following the libadwaita `.toolbar` pattern.
 *
 * Provides 6 px padding and gap — the standard spacing for rows of flat
 * buttons in header bars, action bars, and tool rows. Place `<Spacer />`
 * between leading and trailing groups to push trailing items to the end.
 *
 * Use `<Button variant="flat">` or `<Button variant="raised">` inside:
 * - `flat` for buttons that blend into the bar background.
 * - `raised` for buttons that need explicit elevation within a flat context.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html#toolbar-style-class
 */
export function Toolbar({ children, className, ...props }: ToolbarProps) {
  return (
    <div
      className={[styles.toolbar, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

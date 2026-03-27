import type { HTMLAttributes } from "react";
import styles from "./Toolbar.module.css";

export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Invisible `flex: 1` filler for `Toolbar` and `HeaderBar`.
 *
 * Place between leading and trailing groups to push trailing items to the end.
 * Mirrors `GtkSeparator` with the `.spacer` style class.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html#spacer
 *
 * @example
 * <Toolbar>
 *   <Button variant="flat">Back</Button>
 *   <Spacer />
 *   <Button variant="flat">Done</Button>
 * </Toolbar>
 */
export function Spacer({ className, ...props }: SpacerProps) {
  return (
    <div
      aria-hidden="true"
      className={[styles.spacer, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

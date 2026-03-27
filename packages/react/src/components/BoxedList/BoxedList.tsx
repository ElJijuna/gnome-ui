import { Children, type HTMLAttributes, type ReactNode } from "react";
import styles from "./BoxedList.module.css";

export interface BoxedListProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
}

/**
 * Rounded bordered list — the most common container pattern in GNOME apps.
 *
 * Mirrors the Adwaita `.boxed-list` style applied to a `GtkListBox`.
 * Separators between rows are inserted automatically.
 * Each child is wrapped in a `<li>` — use with `ActionRow` or any row-shaped element.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html#boxed-lists-cards
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export function BoxedList({ children, className, ...props }: BoxedListProps) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <ul
      role="list"
      className={[styles.list, className].filter(Boolean).join(" ")}
      {...props}
    >
      {items.map((child, i) => (
        <li key={i} className={styles.item}>
          {i > 0 && <div className={styles.divider} aria-hidden="true" />}
          {child}
        </li>
      ))}
    </ul>
  );
}

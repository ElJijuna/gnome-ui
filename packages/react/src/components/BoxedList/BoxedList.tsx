import { Children, type HTMLAttributes, type ReactNode } from "react";
import { Separator } from "../Separator";
import styles from "./BoxedList.module.css";

export type BoxedListVariant = "default" | "separate";

export interface BoxedListProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
  /**
   * `"separate"` renders each child as its own standalone rounded card
   * instead of a single joined list — mirrors `.boxed-list-separate`.
   * Use when rows are independent items rather than a continuous group.
   */
  variant?: BoxedListVariant;
}

/**
 * Rounded bordered list — the most common container pattern in GNOME apps.
 *
 * Mirrors the Adwaita `.boxed-list` style applied to a `GtkListBox`.
 * Separators between rows are inserted automatically.
 * Each child is wrapped in a `<li>` — use with `ActionRow` or any row-shaped element.
 *
 * Use `variant="separate"` to render each child as its own card, mirroring
 * the `.boxed-list-separate` style class.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html#boxed-lists-cards
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export function BoxedList({ children, variant = "default", className, ...props }: BoxedListProps) {
  const items = Children.toArray(children).filter(Boolean);
  const separate = variant === "separate";

  return (
    <ul
      role="list"
      className={[styles.list, separate ? styles.separate : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {items.map((child, i) => (
        <li key={i} className={separate ? styles.separateItem : styles.item}>
          {!separate && i > 0 && <Separator aria-hidden="true" />}
          {child}
        </li>
      ))}
    </ul>
  );
}

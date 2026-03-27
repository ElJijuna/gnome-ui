import type { ElementType, HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /**
   * When true the card becomes clickable (Adwaita `.activatable`).
   * Renders as `<button>` by default; override with `as`.
   */
  interactive?: boolean;
  /** Internal spacing. Defaults to `"md"`. */
  padding?: CardPadding;
  /** Override the rendered HTML element. */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Card component following the GNOME HIG and Adwaita `.card` style class.
 *
 * Use for grouping related content on an elevated surface.
 * For clickable cards (e.g. grid item, settings shortcut) set `interactive`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export function Card({
  interactive = false,
  padding = "md",
  as,
  className,
  children,
  ...props
}: CardProps) {
  const Tag: ElementType = as ?? (interactive ? "button" : "div");

  const classes = [
    styles.card,
    styles[`padding-${padding}`],
    interactive ? styles.interactive : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}

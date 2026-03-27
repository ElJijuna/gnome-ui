import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ActionRow.module.css";

export interface ActionRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge. */
  leading?: ReactNode;
  /**
   * Widget placed at the trailing edge (Switch, Button, Text…).
   * For interactive end widgets prefer a controlled component and stop
   * event propagation inside it so the row's own onClick isn't triggered.
   */
  trailing?: ReactNode;
  /**
   * When true the entire row becomes clickable (renders as `<button>`).
   * Use for rows that navigate or trigger an action.
   */
  interactive?: boolean;
  /**
   * `"property"` flips the visual hierarchy: the subtitle becomes the
   * prominent value and the title shrinks to a dim label above it.
   * Use for read-only property display (e.g. "OS Version / Ubuntu 24.04").
   * Mirrors the `.property` style class.
   */
  variant?: "default" | "property";
}

/**
 * Standard settings row with title, optional subtitle, and end widget.
 *
 * Mirrors the Adwaita `AdwActionRow` pattern — the fundamental building block
 * inside a `BoxedList`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ActionRow.html
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export function ActionRow({
  title,
  subtitle,
  leading,
  trailing,
  interactive = false,
  variant = "default",
  className,
  ...props
}: ActionRowProps) {
  const Tag = interactive ? "button" : "div";
  const property = variant === "property";

  const classes = [
    styles.row,
    interactive ? styles.interactive : null,
    property ? styles.property : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...(props as HTMLAttributes<HTMLElement>)}>
      {leading && <span className={styles.leading}>{leading}</span>}

      <span className={styles.content}>
        <span className={property ? styles.propertyLabel : styles.title}>{title}</span>
        {subtitle && <span className={property ? styles.propertyValue : styles.subtitle}>{subtitle}</span>}
      </span>

      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </Tag>
  );
}

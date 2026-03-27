import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ButtonRow.module.css";

export type ButtonRowVariant = "default" | "suggested" | "destructive";

export interface ButtonRowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Label displayed centered in the row. */
  title: string;
  /** Visual style that colours the title text. */
  variant?: ButtonRowVariant;
  /** Icon placed at the leading edge. */
  leading?: ReactNode;
  /** Icon placed at the trailing edge. */
  trailing?: ReactNode;
}

/**
 * Full-width activatable row styled as a button inside a `BoxedList`.
 *
 * Mirrors `AdwButtonRow` — use when an entire list row should trigger a single
 * action. Prefer `ActionRow` with `interactive` when the row also needs a
 * title/subtitle layout; prefer `ButtonRow` for single-label CTA rows.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ButtonRow.html
 */
export function ButtonRow({
  title,
  variant = "default",
  leading,
  trailing,
  className,
  ...props
}: ButtonRowProps) {
  const classes = [
    styles.row,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.title}>{title}</span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </button>
  );
}

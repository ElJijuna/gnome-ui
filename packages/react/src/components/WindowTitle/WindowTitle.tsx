import type { HTMLAttributes } from "react";
import styles from "./WindowTitle.module.css";

export interface WindowTitleProps extends HTMLAttributes<HTMLDivElement> {
  /** Primary title — rendered in bold. */
  title: string;
  /** Secondary subtitle — rendered smaller and dimmed below the title. */
  subtitle?: string;
}

/**
 * Two-line title + subtitle widget for use inside a `HeaderBar`.
 *
 * Pass as the `title` prop of `HeaderBar` to get a centred two-line header
 * that shows an app name and current document/view name.
 *
 * Mirrors `AdwWindowTitle`.
 *
 * @example
 * ```tsx
 * <HeaderBar title={<WindowTitle title="Files" subtitle="/home/user/Documents" />} />
 * ```
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.WindowTitle.html
 */
export function WindowTitle({ title, subtitle, className, ...props }: WindowTitleProps) {
  return (
    <div
      className={[styles.windowTitle, className].filter(Boolean).join(" ")}
      {...props}
    >
      <span className={styles.title}>{title}</span>
      {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
    </div>
  );
}

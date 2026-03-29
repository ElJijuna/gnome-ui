import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./PreferencesGroup.module.css";

export interface PreferencesGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Group heading. */
  title?: string;
  /** Optional description rendered below the title. */
  description?: string;
  /** Widget placed at the trailing edge of the title row (e.g. a reset Button). */
  headerSuffix?: ReactNode;
  /** `BoxedList` rows or any row-shaped content. */
  children?: ReactNode;
}

/**
 * Titled section that wraps a `BoxedList` with an optional description.
 *
 * Use inside a `PreferencesPage` to group related settings under a named
 * heading. The group is purely a layout and labelling wrapper — it does not
 * render the `BoxedList` itself; pass it as `children`.
 *
 * Mirrors `AdwPreferencesGroup`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.PreferencesGroup.html
 */
export function PreferencesGroup({
  title,
  description,
  headerSuffix,
  children,
  className,
  ...props
}: PreferencesGroupProps) {
  const hasHeader = title || description || headerSuffix;

  return (
    <div
      className={[styles.group, className].filter(Boolean).join(" ")}
      {...props}
    >
      {hasHeader && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && <span className={styles.title}>{title}</span>}
            {description && <span className={styles.description}>{description}</span>}
          </div>
          {headerSuffix && <div className={styles.suffix}>{headerSuffix}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./PreferencesPage.module.css";

export interface PreferencesPageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Page title shown in the sidebar / tab of a `PreferencesDialog`.
   * Required — used as the navigation label.
   */
  title: string;
  /**
   * Name of a symbolic icon displayed next to the page title in the sidebar.
   * Pass a valid icon name from the system icon theme (e.g. `"preferences-system-symbolic"`).
   */
  iconName?: string;
  /** `PreferencesGroup` sections. */
  children?: ReactNode;
}

/**
 * Scrollable page composed of `PreferencesGroup` sections.
 *
 * Use as a child of `PreferencesDialog`. Each page appears as a labelled
 * navigation entry in the dialog sidebar.
 *
 * Mirrors `AdwPreferencesPage`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.PreferencesPage.html
 */
export function PreferencesPage({
  title: _title,
  iconName: _iconName,
  children,
  className,
  ...props
}: PreferencesPageProps) {
  return (
    <div
      className={[styles.page, className].filter(Boolean).join(" ")}
      role="tabpanel"
      {...props}
    >
      <div className={styles.inner}>{children}</div>
    </div>
  );
}

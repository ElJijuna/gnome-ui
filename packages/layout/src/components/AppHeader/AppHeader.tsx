import type { HTMLAttributes, ReactNode } from "react";
import { HeaderBar, WindowTitle } from "@gnome-ui/react";
import styles from "./AppHeader.module.css";

export interface AppHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Primary title shown in the header. */
  title?: ReactNode;
  /** Optional subtitle shown below a string title. */
  subtitle?: string;
  /** Leading controls, usually back/sidebar buttons. */
  leading?: ReactNode;
  /** Optional top-level navigation, usually a `ViewSwitcher`. */
  navigation?: ReactNode;
  /** Optional search control. */
  search?: ReactNode;
  /** Trailing actions, usually flat icon buttons or menus. */
  actions?: ReactNode;
  /** Blend the header into the window chrome. */
  flat?: boolean;
}

/**
 * Opinionated application header for `Layout` / shell compositions.
 *
 * It keeps the GNOME header-bar shape while giving app shells named slots that
 * map cleanly to application structure: leading controls, title, navigation,
 * search, and trailing actions.
 */
export function AppHeader({
  title,
  subtitle,
  leading,
  navigation,
  search,
  actions,
  flat = false,
  className,
  ...props
}: AppHeaderProps) {
  const titleNode =
    typeof title === "string" ? (
      <WindowTitle title={title} subtitle={subtitle} />
    ) : (
      title
    );

  const center = titleNode || navigation
    ? (
        <div className={styles.center}>
          {titleNode && <div className={styles.title}>{titleNode}</div>}
          {navigation && <div className={styles.navigation}>{navigation}</div>}
        </div>
      )
    : undefined;

  const end = search || actions
    ? (
        <div className={styles.end}>
          {search && <div className={styles.search}>{search}</div>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )
    : undefined;

  return (
    <HeaderBar
      className={[styles.appHeader, className].filter(Boolean).join(" ")}
      start={leading}
      title={center}
      end={end}
      flat={flat}
      {...props}
    />
  );
}

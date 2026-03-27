import type { HTMLAttributes, ReactNode } from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import styles from "./StatusPage.module.css";

export interface StatusPageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Large icon displayed above the title.
   * Use an icon from `@gnome-ui/icons` or omit for a text-only page.
   */
  icon?: IconDefinition;
  /**
   * Custom icon node. Use when you need an image, emoji, or
   * a rendered SVG that is not part of `@gnome-ui/icons`.
   * Ignored when `icon` is also provided.
   */
  iconNode?: ReactNode;
  /** Main heading. Keep it short — one noun phrase. */
  title: string;
  /** Supporting description rendered below the title. */
  description?: string;
  /**
   * Optional action area — typically one or two `<Button>` elements.
   * Rendered below the description.
   */
  children?: ReactNode;
}

/**
 * Empty-state / status page following the Adwaita `AdwStatusPage` pattern.
 *
 * Use to fill a view with no content yet, an error state, or a completion
 * confirmation. Centred both horizontally and vertically.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.StatusPage.html
 * @see https://developer.gnome.org/hig/patterns/feedback/empty-states.html
 */
export function StatusPage({
  icon,
  iconNode,
  title,
  description,
  children,
  className,
  ...props
}: StatusPageProps) {
  const iconContent = icon
    ? <Icon icon={icon} width={128} height={128} aria-hidden />
    : iconNode ?? null;

  return (
    <div
      className={[styles.page, className].filter(Boolean).join(" ")}
      {...props}
    >
      {iconContent && (
        <div className={styles.iconWrap} aria-hidden="true">
          {iconContent}
        </div>
      )}

      <p className={styles.title}>{title}</p>

      {description && (
        <p className={styles.description}>{description}</p>
      )}

      {children && (
        <div className={styles.actions}>{children}</div>
      )}
    </div>
  );
}

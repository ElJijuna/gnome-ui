import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./Link.module.css";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * When true the link is treated as external: opens in a new tab,
   * adds `rel="noopener noreferrer"`, and shows a trailing ↗ icon.
   */
  external?: boolean;
  children?: ReactNode;
}

/**
 * Inline hyperlink following GNOME HIG.
 *
 * - Uses the accent colour and shows an underline on hover.
 * - `external` opens a new tab safely and appends a visual ↗ indicator.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/links.html
 */
export function Link({
  external = false,
  children,
  className,
  target,
  rel,
  ...props
}: LinkProps) {
  const isExternal = external || target === "_blank";

  return (
    <a
      className={[styles.link, className].filter(Boolean).join(" ")}
      target={isExternal ? "_blank" : target}
      rel={isExternal ? "noopener noreferrer" : rel}
      {...props}
    >
      {children}
      {isExternal && (
        <span className={styles.externalIcon} aria-label="(opens in new tab)">
          ↗
        </span>
      )}
    </a>
  );
}

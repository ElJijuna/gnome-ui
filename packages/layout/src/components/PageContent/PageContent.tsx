import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { Clamp } from "@gnome-ui/react";
import styles from "./PageContent.module.css";

export type PageContentPadding = "none" | "compact" | "normal" | "spacious";
export type PageContentMaxWidth = "none" | "sm" | "md" | "lg" | "xl" | number;

export interface PageContentProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to `main`. */
  as?: ElementType;
  /** Maximum readable width. Use `none` to fill the available area. */
  maxWidth?: PageContentMaxWidth;
  /** Responsive padding density. */
  padding?: PageContentPadding;
  /** Page content. */
  children?: ReactNode;
}

const maxWidthMap: Record<Exclude<PageContentMaxWidth, "none" | number>, number> = {
  sm: 480,
  md: 600,
  lg: 840,
  xl: 1080,
};

const paddingClass: Record<PageContentPadding, string> = {
  none: styles.paddingNone,
  compact: styles.paddingCompact,
  normal: styles.paddingNormal,
  spacious: styles.paddingSpacious,
};

function resolveMaxWidth(maxWidth: PageContentMaxWidth) {
  if (typeof maxWidth === "number") return maxWidth;
  if (maxWidth === "none") return undefined;
  return maxWidthMap[maxWidth];
}

/**
 * Scroll-safe page content container for `Layout`.
 *
 * It provides the GNOME page padding rhythm and optional Adwaita `Clamp`
 * behaviour for readable content widths.
 */
export function PageContent({
  as: Component = "main",
  maxWidth = "none",
  padding = "normal",
  children,
  className,
  ...props
}: PageContentProps) {
  const maximumSize = resolveMaxWidth(maxWidth);

  return (
    <Component
      className={[
        styles.pageContent,
        paddingClass[padding],
        maximumSize ? styles.clamped : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {maximumSize ? (
        <Clamp maximumSize={maximumSize} className={styles.clamp}>
          {children}
        </Clamp>
      ) : (
        children
      )}
    </Component>
  );
}

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./DashboardGrid.module.css";

export type DashboardGridColumns = 1 | 2 | 3 | 4 | "auto";
export type DashboardGridGap = "sm" | "md" | "lg";

export interface DashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns. `"auto"` uses responsive breakpoints. Defaults to `"auto"`. */
  columns?: DashboardGridColumns;
  /** Gap between items. Defaults to `"md"`. */
  gap?: DashboardGridGap;
  children?: ReactNode;
}

export interface DashboardGridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Column span (1–4). Defaults to `1`. */
  span?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

const GAP_CLASS: Record<DashboardGridGap, string> = {
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
};

function DashboardGridItem({
  span = 1,
  children,
  className,
  style,
  ...props
}: DashboardGridItemProps) {
  const itemStyle: CSSProperties = {
    gridColumn: span > 1 ? `span ${span}` : undefined,
    ...style,
  };

  return (
    <div
      className={[styles.item, className].filter(Boolean).join(" ")}
      style={itemStyle}
      {...props}
    >
      {children}
    </div>
  );
}

export function DashboardGrid({
  columns = "auto",
  gap = "md",
  children,
  className,
  style,
  ...props
}: DashboardGridProps) {
  const gridStyle: CSSProperties = {
    gridTemplateColumns:
      columns === "auto" ? undefined : `repeat(${columns}, 1fr)`,
    ...style,
  };

  return (
    <div
      className={[
        styles.grid,
        GAP_CLASS[gap],
        columns === "auto" && styles.auto,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
}

DashboardGrid.Item = DashboardGridItem;

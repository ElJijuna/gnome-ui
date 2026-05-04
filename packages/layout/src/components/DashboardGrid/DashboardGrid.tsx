import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./DashboardGrid.module.css";

export type DashboardGridColumnCount = 1 | 2 | 3 | 4;
export interface DashboardGridResponsiveColumns {
  sm?: DashboardGridColumnCount;
  md?: DashboardGridColumnCount;
  lg?: DashboardGridColumnCount;
  xl?: DashboardGridColumnCount;
}
export type DashboardGridColumns =
  | DashboardGridColumnCount
  | "auto"
  | DashboardGridResponsiveColumns;
export type DashboardGridGap = "sm" | "md" | "lg";
export type DashboardGridLayout = "grid" | "column";

export interface DashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns. `"auto"` uses fluid auto-fill; an object maps breakpoints. Defaults to `"auto"`. */
  columns?: DashboardGridColumns;
  /** Gap between items. Defaults to `"md"`. */
  gap?: DashboardGridGap;
  /** Layout mode. `"column"` stacks children vertically. Defaults to `"grid"`. */
  layout?: DashboardGridLayout;
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

function isResponsiveColumns(
  columns: DashboardGridColumns,
): columns is DashboardGridResponsiveColumns {
  return typeof columns === "object";
}

function getResponsiveColumnStyle(
  columns: DashboardGridResponsiveColumns,
): CSSProperties {
  return {
    "--dashboard-grid-columns-sm": columns.sm,
    "--dashboard-grid-columns-md": columns.md,
    "--dashboard-grid-columns-lg": columns.lg,
    "--dashboard-grid-columns-xl": columns.xl,
  } as CSSProperties;
}

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
  layout = "grid",
  children,
  className,
  style,
  ...props
}: DashboardGridProps) {
  const responsiveColumns = layout === "grid" && isResponsiveColumns(columns);

  const gridStyle: CSSProperties = {
    gridTemplateColumns:
      layout === "grid" && typeof columns === "number"
        ? `repeat(${columns}, 1fr)`
        : undefined,
    ...(responsiveColumns ? getResponsiveColumnStyle(columns) : null),
    ...style,
  };

  return (
    <div
      className={[
        styles.grid,
        layout === "column" && styles.column,
        GAP_CLASS[gap],
        layout === "grid" && columns === "auto" && styles.auto,
        responsiveColumns && styles.responsive,
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

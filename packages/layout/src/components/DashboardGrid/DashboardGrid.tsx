import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./DashboardGrid.module.css";

// ─── Breakpoints ──────────────────────────────────────────────────────────────
export type DashboardGridBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

const BREAKPOINTS: DashboardGridBreakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"];

// ─── Columns ──────────────────────────────────────────────────────────────────
export type DashboardGridColumnCount =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type DashboardGridResponsiveColumns = Partial<
  Record<DashboardGridBreakpoint, DashboardGridColumnCount>
>;

export type DashboardGridColumns =
  | DashboardGridColumnCount
  | "auto"
  | DashboardGridResponsiveColumns;

// ─── Gap ──────────────────────────────────────────────────────────────────────
export type DashboardGridGapValue = "sm" | "md" | "lg";

export type DashboardGridResponsiveGap = Partial<
  Record<DashboardGridBreakpoint, DashboardGridGapValue>
>;

export type DashboardGridGap = DashboardGridGapValue | DashboardGridResponsiveGap;

// ─── Layout ───────────────────────────────────────────────────────────────────
export type DashboardGridLayout = "grid" | "column";

// ─── Span ────────────────────────────────────────────────────────────────────
export type DashboardGridSpanCount =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type DashboardGridResponsiveSpan = Partial<
  Record<DashboardGridBreakpoint, DashboardGridSpanCount>
>;

export type DashboardGridSpan = DashboardGridSpanCount | DashboardGridResponsiveSpan;

// ─── Offset ───────────────────────────────────────────────────────────────────
export type DashboardGridOffset =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// ─── Props ────────────────────────────────────────────────────────────────────
export interface DashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Column count (1–12), `"auto"` for fluid fill, or breakpoint map. Defaults to `"auto"`. */
  columns?: DashboardGridColumns;
  /** Gap between items. Accepts a size or a breakpoint map. Defaults to `"md"`. */
  gap?: DashboardGridGap;
  /** Layout mode. `"column"` stacks children vertically. Defaults to `"grid"`. */
  layout?: DashboardGridLayout;
  children?: ReactNode;
}

export interface DashboardGridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Column span (1–12) or responsive breakpoint map. Defaults to `1`. */
  span?: DashboardGridSpan;
  /** Columns to skip before this item (0–11). Defaults to `0`. */
  offset?: DashboardGridOffset;
  children?: ReactNode;
}

// ─── Internal helpers ────────────────────────────────────────────────────────
const GAP_TOKEN: Record<DashboardGridGapValue, string> = {
  sm: "var(--gnome-space-2, 12px)",
  md: "var(--gnome-space-3, 18px)",
  lg: "var(--gnome-space-4, 24px)",
};

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function buildColumnStyle(
  columns: DashboardGridColumns,
  layout: DashboardGridLayout,
): CSSProperties {
  if (layout !== "grid") return {};
  if (typeof columns === "number") {
    return { gridTemplateColumns: `repeat(${columns}, 1fr)` };
  }
  if (isObject(columns)) {
    const vars: Record<string, unknown> = {};
    for (const bp of BREAKPOINTS) {
      const val = (columns as DashboardGridResponsiveColumns)[bp];
      if (val !== undefined) vars[`--dashboard-grid-columns-${bp}`] = val;
    }
    return vars as CSSProperties;
  }
  return {};
}

function buildGapStyle(gap: DashboardGridGap): CSSProperties {
  if (typeof gap === "string") {
    return { "--dashboard-grid-gap-xs": GAP_TOKEN[gap] } as CSSProperties;
  }
  const vars: Record<string, unknown> = {};
  for (const bp of BREAKPOINTS) {
    const val = (gap as DashboardGridResponsiveGap)[bp];
    if (val !== undefined) vars[`--dashboard-grid-gap-${bp}`] = GAP_TOKEN[val];
  }
  return vars as CSSProperties;
}

function buildSpanStyle(span: DashboardGridSpan): CSSProperties {
  if (typeof span === "number") {
    return { "--item-span-xs": span } as CSSProperties;
  }
  const vars: Record<string, unknown> = {};
  for (const bp of BREAKPOINTS) {
    const val = (span as DashboardGridResponsiveSpan)[bp];
    if (val !== undefined) vars[`--item-span-${bp}`] = val;
  }
  return vars as CSSProperties;
}

// ─── DashboardGridItem ────────────────────────────────────────────────────────
function DashboardGridItem({
  span = 1,
  offset = 0,
  children,
  className,
  style,
  ...props
}: DashboardGridItemProps) {
  const itemStyle: CSSProperties = {
    ...buildSpanStyle(span),
    ...(offset > 0 ? ({ "--item-offset-xs": offset } as CSSProperties) : null),
    ...style,
  };

  return (
    <div
      className={[styles.item, offset > 0 && styles.itemWithOffset, className]
        .filter(Boolean)
        .join(" ")}
      style={itemStyle}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── DashboardGrid ───────────────────────────────────────────────────────────
export function DashboardGrid({
  columns = "auto",
  gap = "md",
  layout = "grid",
  children,
  className,
  style,
  ...props
}: DashboardGridProps) {
  const isResponsiveColumns = layout === "grid" && isObject(columns);

  const gridStyle: CSSProperties = {
    ...buildColumnStyle(columns, layout),
    ...buildGapStyle(gap),
    ...style,
  };

  return (
    <div
      className={[
        styles.grid,
        layout === "column" && styles.column,
        layout === "grid" && columns === "auto" && styles.auto,
        isResponsiveColumns && styles.responsive,
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

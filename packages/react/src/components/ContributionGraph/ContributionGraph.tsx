import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import styles from "./ContributionGraph.module.css";
import {
  GnomeContext,
  useDateTimeFormatter,
  type GnomeNamedAccentColor,
} from "../GnomeProvider/GnomeContext";

export interface ContributionDay {
  /** ISO 8601 date — "YYYY-MM-DD". */
  date: string;
  /** Non-negative activity count. */
  count: number;
}

export interface ContributionGraphProps {
  /** Activity data. Days absent from the array are treated as count = 0. */
  data: ContributionDay[];
  /**
   * Number of intensity levels (excluding 0).
   * @default 4
   */
  maxLevel?: number;
  /** Cell side length in pixels. @default 12 */
  cellSize?: number;
  /** Gap between cells in pixels. @default 3 */
  cellGap?: number;
  /**
   * Fit the graph to its container by resizing cells and reducing visible
   * weeks when the configured range cannot stay legible.
   * @default true
   */
  responsive?: boolean;
  /** Smallest responsive cell side length in pixels. @default 8 */
  minCellSize?: number;
  /** Largest responsive cell side length in pixels. @default 24 */
  maxCellSize?: number;
  /** 0 = Sunday · 1 = Monday (GNOME locale default). @default 1 */
  weekStartDay?: 0 | 1;
  /** @default true */
  showMonthLabels?: boolean;
  /** @default true */
  showDayLabels?: boolean;
  /** @default true */
  showLegend?: boolean;
  /** Number of week columns to display. @default 52 */
  weeks?: number;
  /** @default "Contribution graph" */
  ariaLabel?: string;
  onDayClick?: (day: ContributionDay) => void;
  /** Returns a plain-text tooltip string for a day. */
  tooltipContent?: (day: ContributionDay) => string;
  className?: string;
}

// Reference Sunday: 2000-01-02 is a Sunday (day index 0)
const REF_SUNDAY = new Date(2000, 0, 2);

function getShortMonth(
  monthIndex: number,
  formatter: Intl.DateTimeFormat,
): string {
  return formatter.format(new Date(2000, monthIndex));
}

function getShortDay(
  dayIndex: number,
  formatter: Intl.DateTimeFormat,
): string {
  const date = new Date(REF_SUNDAY);
  date.setDate(REF_SUNDAY.getDate() + dayIndex);
  return formatter.format(date);
}

const DAY_LABEL_WIDTH = 28;
const MONTH_LABEL_HEIGHT = 20;

const NAMED_ACCENTS = new Set<GnomeNamedAccentColor>([
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "brown",
]);

function accentScale(accentColor: GnomeNamedAccentColor): string[] {
  return [
    "var(--gnome-card-shade-color)",
    `var(--gnome-${accentColor}-1)`,
    `var(--gnome-${accentColor}-2)`,
    `var(--gnome-${accentColor}-4)`,
    `var(--gnome-${accentColor}-5)`,
  ];
}

function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isoToLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fullDateLabel(iso: string, formatter: Intl.DateTimeFormat): string {
  return formatter.format(isoToLocal(iso));
}

interface GridCell {
  iso: string;
  count: number;
  level: number;
  future: boolean;
}

export function ContributionGraph({
  data,
  maxLevel = 4,
  cellSize = 12,
  cellGap = 3,
  responsive = true,
  minCellSize = 8,
  maxCellSize = 24,
  weekStartDay = 1,
  showMonthLabels = true,
  showDayLabels = true,
  showLegend = true,
  weeks = 52,
  ariaLabel = "Contribution graph",
  onDayClick,
  tooltipContent,
  className,
}: ContributionGraphProps) {
  const monthFormatter = useDateTimeFormatter({ month: "short" });
  const weekdayFormatter = useDateTimeFormatter({ weekday: "short" });
  const fullDateFormatter = useDateTimeFormatter({
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const { accentColor } = useContext(GnomeContext);
  const graphAccent = NAMED_ACCENTS.has(accentColor as GnomeNamedAccentColor)
    ? accentColor as GnomeNamedAccentColor
    : "green";
  const svgRef = useRef<SVGSVGElement>(null);
  const graphViewportRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const colors = useMemo(() => accentScale(graphAccent), [graphAccent]);

  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const [focusedCell, setFocusedCell] = useState({ col: 0, row: 0 });
  const [tooltip, setTooltip] = useState<{
    target: SVGRectElement;
    text: string;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    if (!responsive) return;

    const viewport = graphViewportRef.current;
    if (!viewport) return;

    const updateWidth = () => {
      const width = viewport.clientWidth || viewport.getBoundingClientRect().width;
      if (width > 0) setAvailableWidth(width);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [responsive]);

  useEffect(() => {
    if (!tooltip) return;

    const placeTooltip = () => {
      const tooltipNode = tooltipRef.current;
      if (!tooltipNode) return;

      const cellRect = tooltip.target.getBoundingClientRect();
      const tipRect = tooltipNode.getBoundingClientRect();
      const margin = 8;
      const gap = 6;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      const maxLeft = Math.max(margin, viewportWidth - tipRect.width - margin);
      const maxTop = Math.max(margin, viewportHeight - tipRect.height - margin);
      const centeredLeft = cellRect.left + cellRect.width / 2 - tipRect.width / 2;
      const aboveTop = cellRect.top - tipRect.height - gap;
      const preferredTop = aboveTop >= margin ? aboveTop : cellRect.bottom + gap;

      setTooltipPosition({
        left: Math.max(margin, Math.min(centeredLeft, maxLeft)),
        top: Math.max(margin, Math.min(preferredTop, maxTop)),
      });
    };

    placeTooltip();
    window.addEventListener("resize", placeTooltip);
    window.addEventListener("scroll", placeTooltip, { passive: true, capture: true });

    return () => {
      window.removeEventListener("resize", placeTooltip);
      window.removeEventListener("scroll", placeTooltip, { capture: true });
    };
  }, [tooltip]);

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of data) map.set(d.date, d.count);
    return map;
  }, [data]);

  const maxCount = useMemo(
    () => Math.max(1, ...data.map((d) => d.count)),
    [data],
  );

  const dayLabelW = showDayLabels ? DAY_LABEL_WIDTH : 0;
  const monthLabelH = showMonthLabels ? MONTH_LABEL_HEIGHT : 0;
  const configuredWeeks = Math.max(1, Math.floor(weeks));
  const normalizedMinCellSize = Math.max(1, minCellSize);
  const normalizedMaxCellSize = Math.max(normalizedMinCellSize, maxCellSize);
  const fit = useMemo(() => {
    if (!responsive || availableWidth === null) {
      return { cellSize, weeks: configuredWeeks };
    }

    const gridWidth = Math.max(0, availableWidth - dayLabelW);
    const fittedCellSize = (gridWidth + cellGap) / configuredWeeks - cellGap;

    if (fittedCellSize >= normalizedMinCellSize) {
      return {
        cellSize: Math.min(normalizedMaxCellSize, fittedCellSize),
        weeks: configuredWeeks,
      };
    }

    const fittedWeeks = Math.floor((gridWidth + cellGap) / (normalizedMinCellSize + cellGap));
    return {
      cellSize: normalizedMinCellSize,
      weeks: Math.max(1, Math.min(configuredWeeks, fittedWeeks)),
    };
  }, [
    availableWidth,
    cellGap,
    cellSize,
    configuredWeeks,
    dayLabelW,
    normalizedMaxCellSize,
    normalizedMinCellSize,
    responsive,
  ]);
  const visibleWeeks = fit.weeks;
  const resolvedCellSize = fit.cellSize;
  const stride = resolvedCellSize + cellGap;

  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Align to start of current week
    const daysFromWeekStart = (today.getDay() - weekStartDay + 7) % 7;
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - daysFromWeekStart);

    const firstDay = new Date(lastWeekStart);
    firstDay.setDate(lastWeekStart.getDate() - (visibleWeeks - 1) * 7);

    const gridResult: GridCell[][] = [];
    const labels: { col: number; month: string }[] = [];
    let lastMonth = -1;

    for (let col = 0; col < visibleWeeks; col++) {
      const colStart = new Date(firstDay);
      colStart.setDate(firstDay.getDate() + col * 7);

      // Month label when the column starts a new month
      if (colStart.getMonth() !== lastMonth) {
        labels.push({
          col,
          month: getShortMonth(colStart.getMonth(), monthFormatter),
        });
        lastMonth = colStart.getMonth();
      }

      const column: GridCell[] = [];
      for (let row = 0; row < 7; row++) {
        const date = new Date(firstDay);
        date.setDate(firstDay.getDate() + col * 7 + row);
        const future = date > today;
        const iso = dateToIso(date);
        const count = future ? 0 : (countMap.get(iso) ?? 0);
        const level =
          count === 0
            ? 0
            : Math.min(maxLevel, Math.ceil((count / maxCount) * maxLevel));
        column.push({ iso, count, level, future });
      }
      gridResult.push(column);
    }

    return { grid: gridResult, monthLabels: labels };
  }, [countMap, maxCount, maxLevel, visibleWeeks, weekStartDay, monthFormatter]);

  // Always label Mon(1), Wed(3), Fri(5) — rows shift with weekStartDay
  const labelRows = useMemo(
    () =>
      [1, 3, 5].map((dayIndex) => ({
        row: (dayIndex - weekStartDay + 7) % 7,
        label: getShortDay(dayIndex, weekdayFormatter),
      })),
    [weekStartDay, weekdayFormatter],
  );

  const svgWidth = dayLabelW + visibleWeeks * stride - cellGap;
  const svgHeight = monthLabelH + 7 * stride - cellGap;
  const cellRx = Math.min(4, Math.floor(resolvedCellSize / 3));

  useEffect(() => {
    setFocusedCell((current) => ({
      col: Math.min(visibleWeeks - 1, current.col),
      row: current.row,
    }));
  }, [visibleWeeks]);

  function focusCell(col: number, row: number) {
    const c = Math.max(0, Math.min(visibleWeeks - 1, col));
    const r = Math.max(0, Math.min(6, row));
    setFocusedCell({ col: c, row: r });
    svgRef.current
      ?.querySelector<SVGRectElement>(`[data-col="${c}"][data-row="${r}"]`)
      ?.focus();
  }

  function handleCellKey(e: KeyboardEvent, col: number, row: number) {
    const moves: Record<string, [number, number]> = {
      ArrowRight: [col + 1, row],
      ArrowLeft: [col - 1, row],
      ArrowDown: [col, row + 1],
      ArrowUp: [col, row - 1],
    };
    if (moves[e.key]) {
      e.preventDefault();
      focusCell(...moves[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const cell = grid[col]?.[row];
      if (cell && !cell.future) onDayClick?.({ date: cell.iso, count: cell.count });
    }
  }

  function handleMouseEnter(
    e: React.MouseEvent<SVGRectElement>,
    text: string,
  ) {
    setTooltipPosition(null);
    setTooltip({
      target: e.currentTarget,
      text,
    });
  }

  function hideTooltip() {
    setTooltip(null);
    setTooltipPosition(null);
  }

  function cellColor(cell: GridCell): string {
    if (cell.future) return colors[0];
    return colors[Math.min(cell.level, colors.length - 1)] ?? colors[colors.length - 1];
  }

  function cellTooltip(cell: GridCell): string {
    if (cell.future) return fullDateLabel(cell.iso, fullDateFormatter);
    const formattedDate = fullDateLabel(cell.iso, fullDateFormatter);
    return (
      tooltipContent?.({ date: cell.iso, count: cell.count }) ??
      `${cell.count} contribution${cell.count !== 1 ? "s" : ""} on ${formattedDate}`
    );
  }

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
    >
      <div ref={graphViewportRef} className={styles.graphViewport}>
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className={styles.svg}
          aria-label={ariaLabel}
          role="img"
          data-cell-size={resolvedCellSize}
          data-visible-weeks={visibleWeeks}
        >
        {/* Month labels */}
        {showMonthLabels &&
          monthLabels.map(({ col, month }) => (
            <text
              key={`m-${col}`}
              x={dayLabelW + col * stride}
              y={12}
              className={styles.label}
            >
              {month}
            </text>
          ))}

        {/* Day-of-week labels: Mon, Wed, Fri */}
        {showDayLabels &&
          labelRows.map(({ row, label }) => (
            <text
              key={`d-${row}`}
              x={0}
              y={monthLabelH + row * stride + resolvedCellSize - 1}
              className={styles.label}
            >
              {label}
            </text>
          ))}

        {/* Activity grid */}
        <g role="grid" aria-label={ariaLabel}>
          {grid.map((column, col) => (
            <g key={col} role="row">
              {column.map((cell, row) => {
                const tipText = cellTooltip(cell);
                const isFocused =
                  focusedCell.col === col && focusedCell.row === row;

                return (
                  <rect
                    key={`${col}-${row}`}
                    data-col={col}
                    data-row={row}
                    x={dayLabelW + col * stride}
                    y={monthLabelH + row * stride}
                    width={resolvedCellSize}
                    height={resolvedCellSize}
                    rx={cellRx}
                    fill={cellColor(cell)}
                    opacity={cell.future ? 0.35 : 1}
                    className={styles.cell}
                    role="gridcell"
                    aria-label={tipText}
                    aria-disabled={cell.future || undefined}
                    tabIndex={isFocused ? 0 : -1}
                    onClick={() => !cell.future && onDayClick?.({ date: cell.iso, count: cell.count })}
                    onKeyDown={(e) => handleCellKey(e, col, row)}
                    onFocus={() => setFocusedCell({ col, row })}
                    onMouseEnter={(e) => handleMouseEnter(e, tipText)}
                    onMouseLeave={hideTooltip}
                  />
                );
              })}
            </g>
          ))}
        </g>
        </svg>
      </div>

      {tooltip && typeof document !== "undefined" && createPortal(
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          style={
            tooltipPosition
              ? { left: tooltipPosition.left, top: tooltipPosition.top }
              : { visibility: "hidden", left: 0, top: 0 }
          }
          role="tooltip"
        >
          {tooltip.text}
        </div>,
        document.body,
      )}

      {showLegend && (
        <div className={styles.legend}>
          <span className={styles.legendLabel}>Less</span>
          {Array.from({ length: maxLevel + 1 }, (_, i) => (
            <svg
              key={i}
              width={resolvedCellSize}
              height={resolvedCellSize}
              aria-hidden="true"
              className={styles.legendCell}
            >
              <rect
                width={resolvedCellSize}
                height={resolvedCellSize}
                rx={cellRx}
                fill={colors[Math.min(i, colors.length - 1)]}
              />
            </svg>
          ))}
          <span className={styles.legendLabel}>More</span>
        </div>
      )}
    </div>
  );
}

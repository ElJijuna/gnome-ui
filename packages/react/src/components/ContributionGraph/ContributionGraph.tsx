import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import styles from "./ContributionGraph.module.css";

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
  /**
   * Colour scale — length must be maxLevel + 1 (index 0 = empty).
   * Defaults to the Adwaita green palette.
   */
  colorScale?: string[];
  /** Cell side length in pixels. @default 12 */
  cellSize?: number;
  /** Gap between cells in pixels. @default 3 */
  cellGap?: number;
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

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
// 0=Sun … 6=Sat
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_LABEL_WIDTH = 28;
const MONTH_LABEL_HEIGHT = 20;

const DEFAULT_COLORS = [
  "var(--gnome-card-shade-color, rgba(0,0,0,0.07))",
  "var(--gnome-green-1, #8ff0a4)",
  "var(--gnome-green-2, #57e389)",
  "var(--gnome-green-4, #2ec27e)",
  "var(--gnome-green-5, #26a269)",
];

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

function fullDateLabel(iso: string): string {
  return isoToLocal(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
  colorScale,
  cellSize = 12,
  cellGap = 3,
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
  const stride = cellSize + cellGap;
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const colors = colorScale ?? DEFAULT_COLORS;

  const [focusedCell, setFocusedCell] = useState({ col: 0, row: 0 });
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of data) map.set(d.date, d.count);
    return map;
  }, [data]);

  const maxCount = useMemo(
    () => Math.max(1, ...data.map((d) => d.count)),
    [data],
  );

  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Align to start of current week
    const daysFromWeekStart = (today.getDay() - weekStartDay + 7) % 7;
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - daysFromWeekStart);

    const firstDay = new Date(lastWeekStart);
    firstDay.setDate(lastWeekStart.getDate() - (weeks - 1) * 7);

    const gridResult: GridCell[][] = [];
    const labels: { col: number; month: string }[] = [];
    let lastMonth = -1;

    for (let col = 0; col < weeks; col++) {
      const colStart = new Date(firstDay);
      colStart.setDate(firstDay.getDate() + col * 7);

      // Month label when the column starts a new month
      if (colStart.getMonth() !== lastMonth) {
        labels.push({ col, month: SHORT_MONTHS[colStart.getMonth()] });
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
  }, [countMap, maxCount, maxLevel, weeks, weekStartDay]);

  // Always label Mon(1), Wed(3), Fri(5) — rows shift with weekStartDay
  const labelRows = useMemo(
    () =>
      [1, 3, 5].map((dayIndex) => ({
        row: (dayIndex - weekStartDay + 7) % 7,
        label: SHORT_DAYS[dayIndex],
      })),
    [weekStartDay],
  );

  const dayLabelW = showDayLabels ? DAY_LABEL_WIDTH : 0;
  const monthLabelH = showMonthLabels ? MONTH_LABEL_HEIGHT : 0;
  const svgWidth = dayLabelW + weeks * stride - cellGap;
  const svgHeight = monthLabelH + 7 * stride - cellGap;
  const cellRx = Math.min(4, Math.floor(cellSize / 3));

  function focusCell(col: number, row: number) {
    const c = Math.max(0, Math.min(weeks - 1, col));
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
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wRect = wrapper.getBoundingClientRect();
    const rRect = (e.currentTarget as Element).getBoundingClientRect();
    setTooltip({
      x: rRect.left - wRect.left + cellSize / 2,
      y: rRect.top - wRect.top,
      text,
    });
  }

  function cellColor(cell: GridCell): string {
    if (cell.future) return colors[0];
    return colors[Math.min(cell.level, colors.length - 1)] ?? colors[colors.length - 1];
  }

  function cellTooltip(cell: GridCell): string {
    if (cell.future) return fullDateLabel(cell.iso);
    return (
      tooltipContent?.({ date: cell.iso, count: cell.count }) ??
      `${cell.count} contribution${cell.count !== 1 ? "s" : ""} on ${fullDateLabel(cell.iso)}`
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
    >
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className={styles.svg}
        aria-label={ariaLabel}
        role="img"
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
              y={monthLabelH + row * stride + cellSize - 1}
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
                    width={cellSize}
                    height={cellSize}
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
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </g>
          ))}
        </g>
      </svg>

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          {tooltip.text}
        </div>
      )}

      {showLegend && (
        <div className={styles.legend}>
          <span className={styles.legendLabel}>Less</span>
          {Array.from({ length: maxLevel + 1 }, (_, i) => (
            <svg
              key={i}
              width={cellSize}
              height={cellSize}
              aria-hidden="true"
              className={styles.legendCell}
            >
              <rect
                width={cellSize}
                height={cellSize}
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

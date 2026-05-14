import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type {
  DashboardGridBreakpoint,
  DashboardGridGap,
  DashboardGridGapValue,
} from "../DashboardGrid";
import styles from "./MasonryGrid.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
export type MasonryGridColumns =
  | number
  | Partial<Record<DashboardGridBreakpoint, number>>;

export interface MasonryGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns (≥1) or a breakpoint map. Defaults to `3`. */
  columns?: MasonryGridColumns;
  /** Gap between items. Defaults to `"md"`. */
  gap?: DashboardGridGap;
  /**
   * When `true`, attaches a ResizeObserver to every child so the layout
   * recomputes automatically if any item grows or shrinks.
   * Defaults to `false`.
   */
  fresh?: boolean;
  children?: ReactNode;
}

// ─── Breakpoint helpers ───────────────────────────────────────────────────────
const BP_DESC: Array<[DashboardGridBreakpoint, number]> = [
  ["xxl", 1600],
  ["xl", 1200],
  ["lg", 992],
  ["md", 768],
  ["sm", 576],
  ["xs", 0],
];

function resolveColumns(width: number, cols: MasonryGridColumns): number {
  if (typeof cols === "number") return Math.max(1, cols);
  for (const [bp, minW] of BP_DESC) {
    if (width >= minW && cols[bp] !== undefined) return cols[bp]!;
  }
  for (const [bp] of [...BP_DESC].reverse()) {
    if (cols[bp] !== undefined) return cols[bp]!;
  }
  return 3;
}

function resolveGapValue(
  width: number,
  gap: DashboardGridGap,
): DashboardGridGapValue {
  if (typeof gap === "string") return gap;
  for (const [bp, minW] of BP_DESC) {
    if (width >= minW && gap[bp] !== undefined) return gap[bp]!;
  }
  for (const [bp] of [...BP_DESC].reverse()) {
    if (gap[bp] !== undefined) return gap[bp]!;
  }
  return "md";
}

const GAP_TOKEN: Record<DashboardGridGapValue, string> = {
  sm: "--gnome-space-2",
  md: "--gnome-space-3",
  lg: "--gnome-space-4",
};
const GAP_FALLBACK: Record<DashboardGridGapValue, number> = {
  sm: 12,
  md: 18,
  lg: 24,
};

function gapToPx(val: DashboardGridGapValue): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(GAP_TOKEN[val])
    .trim();
  const px = parseFloat(raw);
  return Number.isFinite(px) ? px : GAP_FALLBACK[val];
}

// ─── Layout algorithm ─────────────────────────────────────────────────────────
interface ItemPos {
  top: number;
  left: number;
  width: number;
}

function computeLayout(
  containerWidth: number,
  numCols: number,
  gapPx: number,
  heights: number[],
): { positions: ItemPos[]; containerHeight: number } {
  const colW = (containerWidth - gapPx * (numCols - 1)) / numCols;
  const colH = Array<number>(numCols).fill(0);

  const positions = heights.map((h) => {
    const minH = Math.min(...colH);
    const col = colH.indexOf(minH);
    const pos = { top: colH[col], left: col * (colW + gapPx), width: colW };
    colH[col] += h + gapPx;
    return pos;
  });

  const containerHeight =
    heights.length > 0 ? Math.max(...colH) - gapPx : 0;

  return { positions, containerHeight };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MasonryGrid({
  columns = 3,
  gap = "md",
  fresh = false,
  children,
  className,
  style,
  ...props
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevSerialRef = useRef<string>("");

  const [positions, setPositions] = useState<ItemPos[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);

  const childArray = Children.toArray(children);
  // Keep itemRefs length in sync
  itemRefs.current.length = childArray.length;

  const compute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    if (cw === 0) return;

    const numCols = resolveColumns(cw, columns);
    const gapVal = resolveGapValue(cw, gap);
    const gapPx = gapToPx(gapVal);
    const heights = itemRefs.current.map((el) => el?.offsetHeight ?? 0);

    const { positions: newPos, containerHeight: newH } = computeLayout(
      cw,
      numCols,
      gapPx,
      heights,
    );

    // Bail out if layout unchanged
    const serial = JSON.stringify(newPos) + newH;
    if (serial === prevSerialRef.current) return;
    prevSerialRef.current = serial;

    setPositions(newPos);
    setContainerHeight(newH);
  // childArray.length is intentionally excluded from the exhaustive-deps rule
  // because compute reads itemRefs (a ref) instead of childArray directly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, gap]);

  // Run after every render so new children are measured before first paint
  useLayoutEffect(() => {
    compute();
  });

  // Recompute when the container is resized
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [compute]);

  // Optionally observe each child for height changes (fresh mode)
  useEffect(() => {
    if (!fresh) return;
    const ros: ResizeObserver[] = [];
    itemRefs.current.forEach((el) => {
      if (!el) return;
      const ro = new ResizeObserver(compute);
      ro.observe(el);
      ros.push(ro);
    });
    return () => ros.forEach((ro) => ro.disconnect());
  }, [fresh, childArray.length, compute]);

  const containerStyle: CSSProperties = {
    height: containerHeight || undefined,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={containerStyle}
      {...props}
    >
      {childArray.map((child, i) => {
        const pos = positions[i];
        const itemStyle: CSSProperties = pos
          ? { position: "absolute", top: pos.top, left: pos.left, width: pos.width }
          : { position: "absolute", visibility: "hidden" };
        return (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={styles.item}
            style={itemStyle}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

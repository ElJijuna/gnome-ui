import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GNOME_CHART_PALETTE } from "../../colors";
import styles from "./BarChart.module.css";

export interface BarChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

export interface BarChartProps {
  data: Record<string, unknown>[];
  series: BarChartSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  layout?: "horizontal" | "vertical";
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisFormatter?: (value: number) => string;
  className?: string;
}

const AXIS_STYLE = {
  fontSize: 12,
  fill: "var(--gnome-window-fg-color, rgba(0,0,0,0.8))",
  fontFamily: "var(--gnome-font-family, system-ui)",
};

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: "var(--gnome-popover-bg-color, #fff)",
  border: "1px solid var(--gnome-light-3, #deddda)",
  borderRadius: "var(--gnome-radius-md, 8px)",
  fontFamily: "var(--gnome-font-family, system-ui)",
  fontSize: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
};

export function BarChart({
  data,
  series,
  xAxisKey = "name",
  height = 300,
  showGrid = true,
  showLegend = false,
  stacked = false,
  layout = "horizontal",
  showXAxis = true,
  showYAxis = true,
  yAxisFormatter = (value) => String(value),
  className,
}: BarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <div
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--gnome-light-3, #deddda)"
              horizontal={!isVertical}
              vertical={isVertical}
            />
          )}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                hide={!showYAxis}
                tick={AXIS_STYLE}
                axisLine={{ stroke: "var(--gnome-light-4, #c0bfbc)" }}
                tickLine={false}
                tickFormatter={yAxisFormatter}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                hide={!showXAxis}
                tick={AXIS_STYLE}
                axisLine={false}
                tickLine={false}
                width={72}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                hide={!showXAxis}
                tick={AXIS_STYLE}
                axisLine={{ stroke: "var(--gnome-light-4, #c0bfbc)" }}
                tickLine={false}
              />
              <YAxis
                hide={!showYAxis}
                tick={AXIS_STYLE}
                axisLine={false}
                tickLine={false}
                width={yAxisFormatter ? 48 : 56}
                tickFormatter={yAxisFormatter}
              />
            </>
          )}
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            cursor={{ fill: "var(--gnome-card-shade-color, rgba(0,0,0,0.07))" }}
            labelFormatter={(_, payload) =>
              String(
                (payload?.[0]?.payload as Record<string, unknown>)?.[xAxisKey] ?? ""
              )
            }
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontFamily: "var(--gnome-font-family, system-ui)",
                fontSize: 12,
              }}
            />
          )}
          {series.map((s, i) => {
            const isLast = i === series.length - 1;
            const horizontalRadius: [number, number, number, number] =
              stacked ? (isLast ? [4, 4, 0, 0] : [0, 0, 0, 0]) : [4, 4, 0, 0];
            const verticalRadius: [number, number, number, number] =
              stacked ? (isLast ? [0, 4, 4, 0] : [0, 0, 0, 0]) : [0, 4, 4, 0];
            return (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                fill={s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length]}
                radius={isVertical ? verticalRadius : horizontalRadius}
                stackId={stacked ? "stack" : undefined}
              />
            );
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

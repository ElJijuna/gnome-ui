import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GNOME_CHART_PALETTE } from "../../colors";
import styles from "./AreaChart.module.css";

export interface AreaChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

export interface AreaChartProps {
  data: Record<string, unknown>[];
  series: AreaChartSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
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

export function AreaChart({
  data,
  series,
  xAxisKey = "name",
  height = 300,
  showGrid = true,
  showLegend = false,
  stacked = false,
  className,
}: AreaChartProps) {
  return (
    <div
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--gnome-light-3, #deddda)"
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            tick={AXIS_STYLE}
            axisLine={{ stroke: "var(--gnome-light-4, #c0bfbc)" }}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontFamily: "var(--gnome-font-family, system-ui)",
                fontSize: 12,
              }}
            />
          )}
          {series.map((s, i) => {
            const color =
              s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length];
            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
                stackId={stacked ? "stack" : undefined}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

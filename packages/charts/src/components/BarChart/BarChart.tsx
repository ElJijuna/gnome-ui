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
import { useNumberFormatter } from "@gnome-ui/react";
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
  className,
}: BarChartProps) {
  const formatNumber = useNumberFormatter().format;

  return (
    <div
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
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
            tickFormatter={formatNumber}
          />
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            cursor={{ fill: "var(--gnome-card-shade-color, rgba(0,0,0,0.07))" }}
            formatter={(value: number, name: string) => [formatNumber(value), name]}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontFamily: "var(--gnome-font-family, system-ui)",
                fontSize: 12,
              }}
            />
          )}
          {series.map((s, i) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              fill={s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

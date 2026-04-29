import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GNOME_CHART_PALETTE } from "../../colors";
import styles from "./RadarChart.module.css";

export interface RadarChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

export interface RadarChartProps {
  data: Record<string, unknown>[];
  series: RadarChartSeries[];
  angleKey?: string;
  height?: number;
  filled?: boolean;
  showLegend?: boolean;
  className?: string;
  "aria-label"?: string;
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

export function RadarChart({
  data,
  series,
  angleKey = "name",
  height = 400,
  filled = false,
  showLegend = false,
  className,
  "aria-label": ariaLabel,
}: RadarChartProps) {
  return (
    <div
      role="img"
      aria-label={
        ariaLabel ??
        `Radar chart with ${series.map((s) => s.name ?? s.dataKey).join(", ")}`
      }
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          data={data}
          margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
        >
          <PolarGrid stroke="var(--gnome-light-3, #deddda)" />
          <PolarAngleAxis dataKey={angleKey} tick={AXIS_STYLE} />
          <PolarRadiusAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
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
              <Radar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                stroke={color}
                fill={color}
                fillOpacity={filled ? 0.35 : 0}
                dot={false}
              />
            );
          })}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

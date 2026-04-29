import {
  RadialBarChart as RechartsRadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GNOME_CHART_PALETTE } from "../../colors";
import styles from "./RadialBarChart.module.css";

export interface RadialBarChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface RadialBarChartProps {
  data: RadialBarChartDataItem[];
  height?: number;
  innerRadius?: number | string;
  showLabels?: boolean;
  showLegend?: boolean;
  className?: string;
  "aria-label"?: string;
}

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: "var(--gnome-popover-bg-color, #fff)",
  border: "1px solid var(--gnome-light-3, #deddda)",
  borderRadius: "var(--gnome-radius-md, 8px)",
  fontFamily: "var(--gnome-font-family, system-ui)",
  fontSize: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
};

function ArcLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  name?: string;
}) {
  const { cx, cy, midAngle, innerRadius, outerRadius, name } = props;
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    innerRadius == null ||
    outerRadius == null
  ) {
    return <g />;
  }
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="var(--gnome-window-fg-color, rgba(0,0,0,0.8))"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontFamily="var(--gnome-font-family, system-ui)"
    >
      {name}
    </text>
  );
}

export function RadialBarChart({
  data,
  height = 400,
  innerRadius = "20%",
  showLabels = false,
  showLegend = false,
  className,
  "aria-label": ariaLabel,
}: RadialBarChartProps) {
  const chartData = data.map((item, i) => ({
    name: item.label,
    value: item.value,
    fill: item.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length],
  }));

  return (
    <div
      role="img"
      aria-label={
        ariaLabel ??
        `Radial bar chart: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`
      }
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadialBarChart
          data={chartData}
          innerRadius={innerRadius}
          outerRadius="90%"
          startAngle={180}
          endAngle={0}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <RadialBar
            dataKey="value"
            background={{ fill: "var(--gnome-light-3, #deddda)" }}
            label={showLabels ? ArcLabel : undefined}
          />
          <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
          {showLegend && (
            <Legend
              iconSize={10}
              wrapperStyle={{
                fontFamily: "var(--gnome-font-family, system-ui)",
                fontSize: 12,
              }}
            />
          )}
        </RechartsRadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

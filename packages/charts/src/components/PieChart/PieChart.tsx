import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GNOME_CHART_PALETTE } from "../../colors";
import styles from "./PieChart.module.css";

export interface PieChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  height?: number;
  donut?: boolean;
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

const RADIAN = Math.PI / 180;

function SliceLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  percent?: number;
}) {
  const { cx, cy, midAngle, outerRadius, name, percent } = props;
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    outerRadius == null ||
    percent == null ||
    percent < 0.04
  ) {
    return <g />;
  }
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="var(--gnome-window-fg-color, rgba(0,0,0,0.8))"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontFamily="var(--gnome-font-family, system-ui)"
    >
      {name}
    </text>
  );
}

export function PieChart({
  data,
  height = 400,
  donut = false,
  showLabels = false,
  showLegend = false,
  className,
  "aria-label": ariaLabel,
}: PieChartProps) {
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
        `Pie chart: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`
      }
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value: number, name: string) => [value, name]}
          />
          {showLegend && (
            <Legend
              iconSize={10}
              wrapperStyle={{
                fontFamily: "var(--gnome-font-family, system-ui)",
                fontSize: 12,
              }}
            />
          )}
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={donut ? "45%" : 0}
            outerRadius="80%"
            paddingAngle={2}
            label={showLabels ? SliceLabel : false}
            labelLine={showLabels}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.fill}
                stroke="var(--gnome-window-bg-color, #fff)"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

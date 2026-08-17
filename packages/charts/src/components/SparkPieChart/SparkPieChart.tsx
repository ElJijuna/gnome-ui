import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer } from 'recharts';

import { GNOME_CHART_PALETTE } from '@/colors';

export interface SparkPieChartDataItem {
  value: number;
  color?: string;
}

export interface SparkPieChartProps {
  data: SparkPieChartDataItem[];
  /** Chart diameter in px. Defaults to 40. */
  size?: number;
  /** Render as a donut (hollow center) instead of a solid pie. Defaults to `false`. */
  donut?: boolean;
  /** Gap in degrees between adjacent slices. Ignored for single-item data. Defaults to 2. */
  paddingAngle?: number;
  className?: string;
  'aria-label'?: string;
}

export const SparkPieChart = ({
  data,
  size = 40,
  donut = false,
  paddingAngle = 2,
  className,
  'aria-label': ariaLabel,
}: SparkPieChartProps) => {
  const chartData = data.map((item, i) => ({
    value: item.value,
    fill: item.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length],
  }));

  return (
    <div
      style={{ width: size, height: size }}
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart accessibilityLayer margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={chartData}
            dataKey="value"
            innerRadius={donut ? '55%' : 0}
            outerRadius="100%"
            paddingAngle={chartData.length > 1 ? paddingAngle : 0}
            isAnimationActive={false}
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.fill} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

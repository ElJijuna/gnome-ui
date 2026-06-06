import { Bar, Cell, BarChart as RechartsBarChart, ResponsiveContainer } from 'recharts';

type SparkData = number[] | Record<string, unknown>[];

export interface SparkBarChartProps {
  data: SparkData;
  /** Required when data is an array of objects. Defaults to "value". */
  dataKey?: string;
  /** Defaults to `var(--gnome-accent-color, #3584e4)`. */
  color?: string;
  /** Chart height in px. Defaults to 40. */
  height?: number;
  /** Bar width in px. Recharts auto-sizes when omitted. */
  barSize?: number;
  /** Fill opacity. Defaults to 0.85. */
  fillOpacity?: number;
  className?: string;
  'aria-label'?: string;
}

function normalize(data: SparkData, key: string): Record<string, unknown>[] {
  if (!data.length) {
    return [];
  }

  return typeof data[0] === 'number'
    ? (data as number[]).map((v) => ({ [key]: v }))
    : (data as Record<string, unknown>[]);
}

export const SparkBarChart = ({
  data,
  dataKey = 'value',
  color = 'var(--gnome-accent-color, #3584e4)',
  height = 40,
  barSize,
  fillOpacity = 0.85,
  className,
  'aria-label': ariaLabel,
}: SparkBarChartProps) => {
  const normalized = normalize(data, dataKey);

  return (
    <div
      style={{ width: '100%', height }}
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={normalized}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
          barSize={barSize}
        >
          <Bar
            dataKey={dataKey}
            fill={color}
            fillOpacity={fillOpacity}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          >
            {normalized.map((_, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

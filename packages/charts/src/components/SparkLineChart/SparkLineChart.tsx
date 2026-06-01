import { Line, LineChart as RechartsLineChart, ResponsiveContainer } from 'recharts';

type SparkData = number[] | Record<string, unknown>[];

export interface SparkLineChartProps {
  data: SparkData;
  /** Required when data is an array of objects. Defaults to "value". */
  dataKey?: string;
  /** Defaults to `var(--gnome-accent-color, #3584e4)`. */
  color?: string;
  /** Chart height in px. Defaults to 40. */
  height?: number;
  /** Stroke width. Defaults to 1.5. */
  strokeWidth?: number;
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

export function SparkLineChart({
  data,
  dataKey = 'value',
  color = 'var(--gnome-accent-color, #3584e4)',
  height = 40,
  strokeWidth = 1.5,
  className,
  'aria-label': ariaLabel,
}: SparkLineChartProps) {
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
        <RechartsLineChart data={normalized} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

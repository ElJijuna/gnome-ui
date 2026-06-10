import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer } from 'recharts';

type SparkData = number[] | Record<string, unknown>[];

export interface SparkAreaChartProps {
  data: SparkData;
  /** Required when data is an array of objects. Defaults to "value". */
  dataKey?: string;
  /** Defaults to `var(--gnome-accent-color, #3584e4)`. */
  color?: string;
  /** Chart height in px. Defaults to 40. */
  height?: number;
  /** Stroke width. Defaults to 1.5. */
  strokeWidth?: number;
  /** Render gradient fill. Defaults to true. */
  gradient?: boolean;
  /** Fill opacity when gradient is false. Defaults to 0.2. */
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

export const SparkAreaChart = ({
  data,
  dataKey = 'value',
  color = 'var(--gnome-accent-color, #3584e4)',
  height = 40,
  strokeWidth = 1.5,
  gradient = true,
  fillOpacity = 0.2,
  className,
  'aria-label': ariaLabel,
}: SparkAreaChartProps) => {
  const normalized = normalize(data, dataKey);
  const gradId = `spark-area-${dataKey}`;

  return (
    <div
      style={{ width: '100%', height }}
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          accessibilityLayer
          data={normalized}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
        >
          {gradient && (
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            fill={gradient ? `url(#${gradId})` : color}
            fillOpacity={gradient ? 1 : fillOpacity}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

import { useNumberFormatter } from '@gnome-ui/react';
import {
  Funnel,
  LabelList,
  FunnelChart as RechartsFunnelChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { GNOME_CHART_PALETTE } from '../../colors';

import styles from './FunnelChart.module.css';

export interface FunnelChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  data: FunnelChartDataItem[];
  height?: number;
  showLabels?: boolean;
  className?: string;
}

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: 'var(--gnome-popover-bg-color, #fff)',
  border: '1px solid var(--gnome-border-subtle, rgba(0,0,0,0.15))',
  borderRadius: 'var(--gnome-radius-md, 8px)',
  fontFamily: 'var(--gnome-font-family, system-ui)',
  fontSize: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
};

const LABEL_STYLE = {
  fontSize: 12,
  fill: 'var(--gnome-window-fg-color, rgba(0,0,0,0.8))',
  fontFamily: 'var(--gnome-font-family, system-ui)',
};

export const FunnelChart = ({
  data,
  height = 300,
  showLabels = true,
  className,
}: FunnelChartProps) => {
  const formatNumber = useNumberFormatter().format;

  const coloredData = data.map((item, i) => ({
    ...item,
    fill: item.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length],
  }));

  return (
    <div
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={{ height }}
      role="img"
      aria-label="Funnel chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsFunnelChart accessibilityLayer margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value: number, name: string) => [formatNumber(value), name]}
          />
          <Funnel dataKey="value" data={coloredData} isAnimationActive>
            {showLabels && <LabelList dataKey="name" position="center" style={LABEL_STYLE} />}
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>
    </div>
  );
};

import { Card, Skeleton, Spinner, Text, useNumberFormatter } from '@gnome-ui/react';
import type { HTMLAttributes, ReactNode } from 'react';

import styles from './StatCard.module.css';

export type LoadingType = 'skeleton' | 'spinner';

export type StatCardTrendDirection = 'up' | 'down' | 'neutral';

export interface StatCardTrend {
  direction: StatCardTrendDirection;
  value: number;
  period?: string;
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Metric label. */
  label: string;
  /** Primary value. */
  value: number | string;
  /** Optional unit suffix shown next to the value. */
  unit?: string;
  /** Optional trend indicator. */
  trend?: StatCardTrend;
  /** Optional visual element rendered in the top-right corner. */
  icon?: ReactNode;
  /** Decorative chart or visual rendered behind the metric content. */
  backgroundChart?: ReactNode;
  /** Render a loading placeholder. */
  loading?: boolean;
  /** Loading placeholder style. Defaults to `"skeleton"`. */
  loadingType?: LoadingType;
}

const TREND_SYMBOL: Record<StatCardTrendDirection, string> = {
  up: 'up',
  down: 'down',
  neutral: 'steady',
};

export function StatCard({
  label,
  value,
  unit,
  trend,
  icon,
  backgroundChart,
  loading = false,
  loadingType = 'skeleton',
  className,
  ...props
}: StatCardProps) {
  const numberFormat = useNumberFormatter();

  if (loading) {
    const rootClass = [styles.card, styles.loading, className].filter(Boolean).join(' ');

    if (loadingType === 'spinner') {
      return (
        <Card className={rootClass} aria-busy="true" {...props}>
          <div className={styles.spinnerWrapper}>
            <Spinner size="md" />
          </div>
        </Card>
      );
    }

    return (
      <Card className={rootClass} aria-busy="true" {...props}>
        <div className={styles.header}>
          <Skeleton variant="rect" width={110} height={14} />
          {icon && <Skeleton variant="circle" size={30} />}
        </div>
        <Skeleton variant="rect" width={150} height={34} />
        <Skeleton variant="rect" width={120} height={14} />
      </Card>
    );
  }

  const displayValue = typeof value === 'number' ? numberFormat.format(value) : value;
  const accessibleValue = unit ? `${displayValue} ${unit}` : displayValue;

  return (
    <Card
      className={[styles.card, backgroundChart ? styles.withBackgroundChart : null, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {backgroundChart && (
        <div className={styles.backgroundChart} aria-hidden="true">
          {backgroundChart}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <Text variant="caption" color="dim" className={styles.label}>
            {label}
          </Text>
          {icon && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        <div className={styles.valueRow} aria-label={`${label}: ${accessibleValue}`}>
          <Text variant="title-2" as="span" className={styles.value}>
            {displayValue}
          </Text>
          {unit && (
            <Text variant="caption" as="span" color="dim" className={styles.unit}>
              {unit}
            </Text>
          )}
        </div>

        {trend && (
          <Text
            variant="caption"
            as="span"
            className={[styles.trend, styles[trend.direction]].filter(Boolean).join(' ')}
          >
            <span aria-hidden="true">{TREND_SYMBOL[trend.direction]}</span>
            <span className={styles.trendValue}>
              {`${trend.value > 0 ? '+' : ''}${numberFormat.format(trend.value)}%`}
            </span>
            {trend.period && <span className={styles.period}>{trend.period}</span>}
          </Text>
        )}
      </div>
    </Card>
  );
}

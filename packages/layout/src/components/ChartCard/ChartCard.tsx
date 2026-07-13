import { Card, Separator, Skeleton, Spinner, Text, useNumberFormatter } from '@gnome-ui/react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { LoadingStatus } from '../LoadingStatus';
import type { LoadingType, StatCardTrend } from '../StatCard';

import styles from './ChartCard.module.css';

export interface ChartCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Card title. */
  title: ReactNode;
  /** Optional supporting text below the title. */
  subtitle?: ReactNode;
  /** Optional primary metric shown in the header. */
  value?: number | string;
  /** Optional unit suffix shown next to the metric. */
  unit?: string;
  /** Optional trend indicator shown below the metric. */
  trend?: StatCardTrend;
  /** Header actions: buttons, menus, filters, or export controls. */
  actions?: ReactNode;
  /** Chart or visualization body. */
  children?: ReactNode;
  /** Footer/status content below the chart. */
  footer?: ReactNode;
  /** Render a loading placeholder instead of card content. */
  loading?: boolean;
  /** Loading placeholder style. Defaults to `"skeleton"`. */
  loadingType?: LoadingType;
  /** Error content shown instead of the chart. */
  error?: ReactNode;
  /** Empty-state content shown instead of the chart when no error exists. */
  empty?: ReactNode;
  /** Minimum chart body height. Defaults to `220`. */
  chartHeight?: number | string;
}

const TREND_SYMBOL: Record<StatCardTrend['direction'], string> = {
  up: 'up',
  down: 'down',
  neutral: 'steady',
};

function toCssSize(value: number | string) {
  return typeof value === 'number' ? `${value}px` : value;
}

function renderMessage(message: ReactNode, variant: 'empty' | 'error') {
  if (typeof message === 'string') {
    return (
      <Text variant="body" color={variant === 'error' ? 'error' : 'dim'}>
        {message}
      </Text>
    );
  }

  return message;
}

export const ChartCard = ({
  title,
  subtitle,
  value,
  unit,
  trend,
  actions,
  children,
  footer,
  loading = false,
  loadingType = 'skeleton',
  error,
  empty,
  chartHeight = 220,
  className,
  style,
  ...props
}: ChartCardProps) => {
  const numberFormat = useNumberFormatter();
  const displayValue = typeof value === 'number' ? numberFormat.format(value) : value;
  const accessibleValue = unit ? `${displayValue} ${unit}` : displayValue;
  const hasMetric = displayValue !== undefined;
  const hasFooter = footer !== undefined;
  const chartStyle = {
    '--chart-card-chart-min-height': toCssSize(chartHeight),
  } as CSSProperties;
  const rootStyle = {
    ...chartStyle,
    ...style,
  };

  if (loading) {
    const rootClass = [styles.root, styles.loading, className].filter(Boolean).join(' ');

    if (loadingType === 'spinner') {
      return (
        <Card padding="none" className={rootClass} style={rootStyle} aria-busy="true" {...props}>
          <div className={styles.spinnerWrapper}>
            <Spinner size="md" />
          </div>
        </Card>
      );
    }

    return (
      <Card padding="none" className={rootClass} style={rootStyle} aria-busy="true" {...props}>
        <LoadingStatus />
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <Skeleton variant="rect" width={140} height={16} />
            <Skeleton variant="rect" width={96} height={12} />
          </div>
          <Skeleton variant="rect" width={84} height={28} />
        </div>
        <Separator />
        <div className={styles.chart}>
          <Skeleton variant="rect" height="100%" />
        </div>
      </Card>
    );
  }

  const bodyState = error !== undefined ? 'error' : empty !== undefined ? 'empty' : null;

  return (
    <Card
      padding="none"
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={rootStyle}
      {...props}
    >
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          {typeof title === 'string' ? (
            <Text variant="heading" className={styles.title}>
              {title}
            </Text>
          ) : (
            title
          )}
          {subtitle &&
            (typeof subtitle === 'string' ? (
              <Text variant="caption" color="dim" className={styles.subtitle}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            ))}
        </div>

        {(hasMetric || actions) && (
          <div className={styles.headerEnd}>
            {hasMetric && (
              <div className={styles.metric} aria-label={`${title}: ${accessibleValue}`}>
                <div className={styles.valueRow}>
                  <Text variant="title-3" as="span" className={styles.value}>
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
            )}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
        )}
      </div>

      <Separator />

      <div
        className={[styles.chart, bodyState ? styles.stateChart : null].filter(Boolean).join(' ')}
      >
        {error !== undefined ? (
          <div className={[styles.state, styles.errorState].join(' ')} role="alert">
            {renderMessage(error, 'error')}
          </div>
        ) : empty !== undefined ? (
          <div className={styles.state}>{renderMessage(empty, 'empty')}</div>
        ) : (
          children
        )}
      </div>

      {hasFooter && (
        <>
          <Separator />
          <div className={styles.footer}>{footer}</div>
        </>
      )}
    </Card>
  );
};

import type { HTMLAttributes, ReactNode } from 'react';

import { SeverityBadge, type VulnerabilitySeverity } from '../SeverityBadge';

import styles from './SecurityMetric.module.css';

export type SecurityMetricTrend = 'up' | 'down' | 'neutral';

export interface SecurityMetricProps extends HTMLAttributes<HTMLDivElement> {
  /** Short label for the metric, for example `Critical findings`. */
  label: ReactNode;
  /** Primary value to display. Keep it short: numbers, percentages, or compact text. */
  value: ReactNode;
  /** Optional supporting text shown below the value. */
  description?: ReactNode;
  /** Optional delta text, for example `+3 since last scan`. */
  delta?: ReactNode;
  /** Visual direction for the delta. Defaults to `"neutral"` when `delta` is present. */
  trend?: SecurityMetricTrend;
  /** Optional vulnerability severity tone associated with the metric. */
  severity?: VulnerabilitySeverity;
}

const isAccessibleText = (value: ReactNode): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

/**
 * Compact KPI card for vulnerability reports and security dashboards.
 */
export const SecurityMetric = ({
  label,
  value,
  description,
  delta,
  trend = 'neutral',
  severity,
  className,
  'aria-label': ariaLabel,
  ...props
}: SecurityMetricProps) => {
  const accessibleLabel =
    ariaLabel ??
    (isAccessibleText(label) && isAccessibleText(value) ? `${label}: ${value}` : undefined);

  return (
    <div
      aria-label={accessibleLabel}
      className={[
        styles.metric,
        severity ? styles[severity] : null,
        delta ? styles[`trend-${trend}`] : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-severity={severity}
      data-trend={delta ? trend : undefined}
      {...props}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {severity ? <SeverityBadge severity={severity} /> : null}
      </div>
      <div className={styles.value}>{value}</div>
      {description || delta ? (
        <div className={styles.footer}>
          {description ? <span className={styles.description}>{description}</span> : null}
          {delta ? <span className={styles.delta}>{delta}</span> : null}
        </div>
      ) : null}
    </div>
  );
};

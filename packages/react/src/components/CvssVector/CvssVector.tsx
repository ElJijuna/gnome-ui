import type { HTMLAttributes } from 'react';

import styles from './CvssVector.module.css';
import { parseCvssVector } from './vector';

export interface CvssVectorProps extends HTMLAttributes<HTMLDivElement> {
  /** CVSS vector string, for example `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`. */
  vector: string;
  /** Whether to render the raw vector string. */
  showVector?: boolean;
  /** Whether to render expanded metric labels. */
  showMetrics?: boolean;
}

/**
 * Readable CVSS vector display for vulnerability reports and scan details.
 */
export const CvssVector = ({
  vector,
  showVector = true,
  showMetrics = true,
  className,
  'aria-label': ariaLabel,
  ...props
}: CvssVectorProps) => {
  const parsed = parseCvssVector(vector);
  const metricsLabel = parsed.metrics
    .map((metric) => `${metric.label} ${metric.valueLabel}`)
    .join(', ');

  return (
    <div
      aria-label={ariaLabel ?? `CVSS vector${parsed.version ? ` ${parsed.version}` : ''}`}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-valid={parsed.valid ? 'true' : 'false'}
      data-version={parsed.version}
      {...props}
    >
      {showVector ? <code className={styles.vector}>{vector}</code> : null}
      {showMetrics && parsed.metrics.length > 0 ? (
        <dl aria-label={metricsLabel} className={styles.metrics}>
          {parsed.metrics.map((metric) => (
            <div
              className={styles.metric}
              data-known={metric.known ? 'true' : 'false'}
              key={`${metric.key}:${metric.value}`}
            >
              <dt className={styles.metricLabel}>{metric.label}</dt>
              <dd className={styles.metricValue}>
                <span aria-hidden="true" className={styles.metricCode}>
                  {metric.key}:{metric.value}
                </span>
                <span>{metric.valueLabel}</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
};

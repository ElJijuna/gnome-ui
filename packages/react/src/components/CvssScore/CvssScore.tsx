import type { HTMLAttributes } from 'react';

import { SeverityBadge, type VulnerabilitySeverity } from '../SeverityBadge';

import styles from './CvssScore.module.css';
import { formatCvssScore, getCvssSeverity } from './cvss';

export interface CvssScoreProps extends HTMLAttributes<HTMLDivElement> {
  /** CVSS base score. Values outside 0–10 are clamped for display. */
  score: number;
  /**
   * Overrides the derived severity.
   *
   * CVSS-derived severities use `none`, `low`, `medium`, `high`, and
   * `critical`. Pass `minimal` only when showing a scanner-provided severity
   * that is not derived from the CVSS qualitative rating.
   */
  severity?: VulnerabilitySeverity;
  /** Whether to show the textual severity badge next to the score. */
  showSeverity?: boolean;
}

/**
 * Compact CVSS score display for vulnerability tables, findings, and summaries.
 */
export const CvssScore = ({
  score,
  severity,
  showSeverity = true,
  className,
  'aria-label': ariaLabel,
  ...props
}: CvssScoreProps) => {
  const displayedScore = formatCvssScore(score);
  const resolvedSeverity = severity ?? getCvssSeverity(score);

  return (
    <div
      aria-label={ariaLabel ?? `CVSS score ${displayedScore}, ${resolvedSeverity} severity`}
      className={[styles.root, styles[resolvedSeverity], className].filter(Boolean).join(' ')}
      data-severity={resolvedSeverity}
      {...props}
    >
      <span className={styles.score}>{displayedScore}</span>
      <span className={styles.max}>/10</span>
      {showSeverity ? <SeverityBadge severity={resolvedSeverity} /> : null}
    </div>
  );
};

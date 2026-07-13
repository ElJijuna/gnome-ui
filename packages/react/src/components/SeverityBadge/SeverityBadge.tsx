import type { HTMLAttributes } from 'react';

import styles from './SeverityBadge.module.css';
import { VULNERABILITY_SEVERITY_LABELS, type VulnerabilitySeverity } from './severity';

export interface SeverityBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Vulnerability severity to display.
   *
   * `minimal` is included for external scanner compatibility, such as
   * Google Artifact Registry / Grafeas. CVSS qualitative ratings still map
   * to the official `none`, `low`, `medium`, `high`, and `critical` levels.
   */
  severity: VulnerabilitySeverity;
  /** Overrides the default human-readable label. */
  label?: string;
}

/**
 * Pill-shaped severity label for vulnerability and security report surfaces.
 */
export const SeverityBadge = ({
  severity,
  label,
  className,
  'aria-label': ariaLabel,
  ...props
}: SeverityBadgeProps) => {
  const displayLabel = label ?? VULNERABILITY_SEVERITY_LABELS[severity];

  return (
    <span
      aria-label={ariaLabel ?? `Severity: ${displayLabel}`}
      className={[styles.badge, styles[severity], className].filter(Boolean).join(' ')}
      data-severity={severity}
      {...props}
    >
      {displayLabel}
    </span>
  );
};

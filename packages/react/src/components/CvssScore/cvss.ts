import type { VulnerabilitySeverity } from '../SeverityBadge';

export type CvssSeverity = Exclude<VulnerabilitySeverity, 'minimal'>;

export const CVSS_SCORE_MIN = 0;
export const CVSS_SCORE_MAX = 10;

export function clampCvssScore(score: number) {
  if (Number.isNaN(score)) {
    return CVSS_SCORE_MIN;
  }

  return Math.min(CVSS_SCORE_MAX, Math.max(CVSS_SCORE_MIN, score));
}

export function getCvssSeverity(score: number): CvssSeverity {
  const clamped = clampCvssScore(score);

  if (clamped === 0) {
    return 'none';
  }

  if (clamped < 4) {
    return 'low';
  }

  if (clamped < 7) {
    return 'medium';
  }

  if (clamped < 9) {
    return 'high';
  }

  return 'critical';
}

export function formatCvssScore(score: number) {
  return clampCvssScore(score).toFixed(1);
}

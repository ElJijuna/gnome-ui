export type VulnerabilitySeverity = 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'critical';

export const VULNERABILITY_SEVERITIES: readonly VulnerabilitySeverity[] = [
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'critical',
];

export const VULNERABILITY_SEVERITY_LABELS: Record<VulnerabilitySeverity, string> = {
  none: 'None',
  minimal: 'Minimal',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const VULNERABILITY_SEVERITY_RANK: Record<VulnerabilitySeverity, number> = {
  none: 0,
  minimal: 1,
  low: 2,
  medium: 3,
  high: 4,
  critical: 5,
};

export interface CvssVectorMetric {
  /** Short CVSS metric key, for example `AV`. */
  key: string;
  /** Human-readable metric name. */
  label: string;
  /** Short CVSS metric value, for example `N`. */
  value: string;
  /** Human-readable metric value. */
  valueLabel: string;
  /** Whether the metric key and value are known by this component. */
  known: boolean;
}

export interface ParsedCvssVector {
  /** CVSS version from the vector prefix when present. */
  version?: string;
  /** Parsed vector metrics in source order. */
  metrics: CvssVectorMetric[];
  /** Whether the vector includes a supported CVSS 3.x prefix and parseable metrics. */
  valid: boolean;
}

const CVSS_VECTOR_PREFIX_PATTERN = /^CVSS:(3\.[01])$/;

const CVSS_METRIC_LABELS: Record<string, string> = {
  AV: 'Attack Vector',
  AC: 'Attack Complexity',
  PR: 'Privileges Required',
  UI: 'User Interaction',
  S: 'Scope',
  C: 'Confidentiality',
  I: 'Integrity',
  A: 'Availability',
};

const CVSS_METRIC_VALUE_LABELS: Record<string, Record<string, string>> = {
  AV: {
    N: 'Network',
    A: 'Adjacent',
    L: 'Local',
    P: 'Physical',
  },
  AC: {
    L: 'Low',
    H: 'High',
  },
  PR: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
  UI: {
    N: 'None',
    R: 'Required',
  },
  S: {
    U: 'Unchanged',
    C: 'Changed',
  },
  C: {
    H: 'High',
    L: 'Low',
    N: 'None',
  },
  I: {
    H: 'High',
    L: 'Low',
    N: 'None',
  },
  A: {
    H: 'High',
    L: 'Low',
    N: 'None',
  },
};

export function parseCvssVector(vector: string): ParsedCvssVector {
  const segments = vector
    .trim()
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);
  const [prefix, ...metricSegments] = segments;
  const version = prefix?.match(CVSS_VECTOR_PREFIX_PATTERN)?.[1];

  const metrics = metricSegments.map((segment) => {
    const [rawKey = '', rawValue = ''] = segment.split(':');
    const key = rawKey.toUpperCase();
    const value = rawValue.toUpperCase();
    const label = CVSS_METRIC_LABELS[key] ?? key;
    const valueLabel = CVSS_METRIC_VALUE_LABELS[key]?.[value] ?? value;

    return {
      key,
      label,
      value,
      valueLabel,
      known: Boolean(CVSS_METRIC_LABELS[key] && CVSS_METRIC_VALUE_LABELS[key]?.[value]),
    };
  });

  return {
    version,
    metrics,
    valid: Boolean(version && metrics.length > 0 && metrics.every((metric) => metric.known)),
  };
}

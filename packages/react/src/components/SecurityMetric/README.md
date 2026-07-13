# SecurityMetric

Compact KPI card for cybersecurity reports and vulnerability dashboards.

```tsx
import { SecurityMetric } from "@gnome-ui/react";

<SecurityMetric
  label="Critical findings"
  value={7}
  severity="critical"
  description="Require immediate triage"
  delta="+2 since last scan"
  trend="up"
/>
```

Use it for report-level summaries such as open CVEs, critical findings, average
CVSS, vulnerable assets, SLA breaches, or scanner-specific counts.

`severity` accepts the same values as `SeverityBadge`, including `minimal` for
external scanner compatibility.

Trend colors assume vulnerability-report semantics: `up` is unfavorable, `down`
is favorable, and `neutral` is informational.

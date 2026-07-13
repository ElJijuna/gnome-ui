Pill-shaped label for vulnerability severities in security reports, CVE tables,
dashboards, and scanner results.

```tsx
import { SeverityBadge } from "@gnome-ui/react";

<SeverityBadge severity="critical" />
<SeverityBadge severity="minimal" />
```

Supported severities are ordered as:

`none < minimal < low < medium < high < critical`

`minimal` is included for external scanner compatibility, such as Google
Artifact Registry / Grafeas. CVSS qualitative ratings should continue to use
the official `none`, `low`, `medium`, `high`, and `critical` levels.

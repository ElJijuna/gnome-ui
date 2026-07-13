Compact CVSS score display for vulnerability tables, finding summaries, and CVE
detail surfaces.

```tsx
import { CvssScore } from "@gnome-ui/react";

<CvssScore score={9.8} />
<CvssScore score={0} severity="minimal" />
```

CVSS-derived ratings follow the official qualitative ranges:

`0.0 none`, `0.1–3.9 low`, `4.0–6.9 medium`, `7.0–8.9 high`,
`9.0–10.0 critical`.

Use the `severity` override when displaying a scanner-provided severity. This is
how `minimal` can appear alongside a score without treating it as an official
CVSS qualitative rating.

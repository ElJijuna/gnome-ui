# CvssVector

Readable CVSS vector display for vulnerability reports, scan details, and CVE
analysis views.

```tsx
import { CvssVector } from "@gnome-ui/react";

<CvssVector vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" />
```

The component renders the raw vector and expands CVSS 3.0 / 3.1 base metrics
into labels such as Attack Vector, Attack Complexity, Privileges Required,
Confidentiality, Integrity, and Availability.

Use it next to `CvssScore` when a report needs both the qualitative score and
the underlying vector that produced it.

Unknown tokens are still rendered and marked with `data-known="false"` so
scanner-specific or future CVSS values remain visible instead of being dropped.

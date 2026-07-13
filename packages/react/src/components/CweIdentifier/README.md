# CweIdentifier

Monospace CWE identifier for vulnerability reports, weakness taxonomies, and
scan result summaries.

```tsx
import { CweIdentifier } from "@gnome-ui/react";

<CweIdentifier cweId="CWE-79" />
```

The component normalizes numeric input such as `79` to `CWE-79`, validates the
identifier, and links to the matching MITRE CWE definition by default.

Use it alongside `CveIdentifier`, `CvssScore`, `CvssVector`, and
`VulnerabilityFinding` when a report needs to connect an issue to both a
specific vulnerability and its underlying weakness category.

Invalid values remain visible and are marked with `data-valid="false"` so
scanner output is not silently dropped.

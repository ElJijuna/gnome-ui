# AffectedPackage

Package coordinate summary for vulnerability findings, SBOMs, dependency scans,
container image scans, and remediation reports.

```tsx
import { AffectedPackage } from "@gnome-ui/react";

<AffectedPackage
  ecosystem="npm"
  name="lodash"
  version="4.17.20"
  fixedVersion="4.17.21"
/>
```

The component displays the package ecosystem, name, vulnerable version, fixed
version, digest, and Package URL (PURL). When `purl` is omitted and the package
name/version are plain text, a PURL like `pkg:npm/lodash@4.17.20` is generated.

Use it inside `VulnerabilityFinding` or next to `CveIdentifier`, `CweIdentifier`,
`CvssScore`, and `CvssVector` to make affected assets explicit in reports.

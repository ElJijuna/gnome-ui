Monospace CVE identifier for vulnerability tables, findings, and report
references.

```tsx
import { CveIdentifier } from "@gnome-ui/react";

<CveIdentifier cveId="CVE-2024-3094" />
<CveIdentifier cveId="CVE-2024-3094" source="nvd" />
<CveIdentifier cveId="CVE-2024-3094" link={false} />
```

The component normalizes input to uppercase and marks invalid identifiers with
`data-valid="false"`. CVE IDs follow the `CVE-YYYY-NNNN` shape, with at least
four digits in the sequence number.

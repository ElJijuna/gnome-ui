Status dot for communicating the health of a service, connection, or resource.

Colors follow Adwaita tokens (`--gnome-success-color`, `--gnome-warning-color`,
`--gnome-error-color`). The `loading` status pulses via CSS animation and
respects `prefers-reduced-motion`.

```tsx
import { StatusIndicator } from "@gnome-ui/layout";

<StatusIndicator status="online"  label="Database" />
<StatusIndicator status="warning" label="API Gateway" description="High latency" />
<StatusIndicator status="offline" label="Backup Service" />
```

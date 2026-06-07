Resource usage card with a labeled progress bar.

Composes `Card` and `ProgressBar` from `@gnome-ui/react`. The fill color shifts automatically at usage thresholds: accent (< 75%), warning (≥ 75%), error (≥ 90%).

```tsx
import { ProgressCard } from "@gnome-ui/layout";

<ProgressCard label="Storage" used={42.5} total={128} unit="GB" />
<ProgressCard label="Memory"  used={96}   total={128} unit="GB" icon={<MemoryIcon />} />
```

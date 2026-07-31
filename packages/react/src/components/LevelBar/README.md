Discrete level indicator with colour-coded low/high offset zones — mirrors `GtkLevelBar`.

```tsx
import { LevelBar } from '@gnome-ui/react';

<LevelBar value={0.82} low={0.25} high={0.9} aria-label="Disk usage" />
```

### When to use which bar

| Component | Use for |
|-----------|---------|
| `ProgressBar` | Determinate/indeterminate task progress (a download, an install) |
| `LevelBar` | A scalar measurement or gauge (disk usage, battery, signal strength) |
| `SegmentedBar` | A proportional breakdown across categories that sum to a whole |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value, clamped to `[min, max]` (required) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `1` | Maximum value |
| `low` | `number` | — | Threshold at or below which the bar renders in `lowVariant` |
| `lowVariant` | `LevelBarVariant` | `"warning"` | Colour used when `value <= low` |
| `high` | `number` | — | Threshold at or above which the bar renders in `highVariant` |
| `highVariant` | `LevelBarVariant` | `"error"` | Colour used when `value >= high` |
| `variant` | `LevelBarVariant` | `"accent"` | Colour used between `low` and `high` |
| `discrete` | `boolean` | `false` | Render as a row of blocks instead of a continuous fill |
| `numBlocks` | `number` | `10` | Number of blocks when `discrete` is `true` |

### Guidelines

- Set `low`/`high` when a value entering a zone is meaningful to the user — e.g. a disk-usage bar turning `error` above 90 %, or a battery bar turning `warning` below 20 %. Omit them for a plain single-colour gauge.
- Use `discrete` mode for signal-strength or step-count style indicators, where individual increments matter more than the exact fraction.
- Always provide an `aria-label` or `aria-labelledby` — the bar renders as `role="meter"`, the WAI-ARIA role for a scalar measurement, distinct from `role="progressbar"`.

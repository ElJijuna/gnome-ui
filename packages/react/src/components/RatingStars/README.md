Star rating display and input.

```tsx
import { RatingStars } from '@gnome-ui/react';

// Read-only — omit onChange
<RatingStars value={4.2} max={5} aria-label="Average rating: 4.2 out of 5" />

// Interactive — pass onChange
<RatingStars value={rating} onChange={setRating} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current rating, clamped to `[0, max]` (required) |
| `max` | `number` | `5` | Number of stars |
| `onChange` | `(value: number) => void` | — | Presence makes the component interactive; omit for a read-only display |
| `size` | `IconSize` | `"md"` | Star size |
| `disabled` | `boolean` | `false` | Renders as read-only even when `onChange` is provided |

### Guidelines

- Omit `onChange` for a read-only summary (e.g. an average rating from other users) — it renders as `role="img"` with a generated `"N out of M stars"` label.
- Pass `onChange` for a rating input — it renders as `role="radiogroup"` with roving-tabindex, arrow-key navigation (`←/→` or `↓/↑`, `Home`/`End`), and a hover preview that doesn't commit until clicked.
- Whole-star granularity only — there is no half-star display. Round an average rating with `Math.round()` before passing it as `value` in read-only mode.

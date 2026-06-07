Determinate and indeterminate progress bar following the Adwaita style.

### Guidelines
- Use **determinate** (`value` 0–1) when you know the exact completion percentage.
- Use **indeterminate** (no `value`) when duration is unknown — prefer `Spinner` for short waits.
- Always provide an `aria-label` or `aria-labelledby` so screen readers can announce what is loading.
- Pair with a text label to show the percentage or description alongside the bar.
- Respects `prefers-reduced-motion` — the indeterminate animation is stopped and the bar shown at full width with reduced opacity.

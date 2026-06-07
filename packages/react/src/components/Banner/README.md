Persistent message strip displayed at the top of a view.

Mirrors the Adwaita `AdwBanner` pattern.

### Guidelines
- Place at the very top of the content area, below the header bar.
- Keep the message short — one sentence. Use a **Dialog** for longer explanations.
- Provide an `actionLabel` only when there is a clear, single action the user can take.
- Use `dismissible` when the message is informational and non-critical.
- Choose the `variant` that matches the severity: `info` → `warning` → `error`.
- Don't stack multiple banners — show only the most important one at a time.

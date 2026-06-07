Non-blocking temporary notification following the Adwaita `AdwToast` pattern.

Two components:
- **`Toast`** — the notification card. Manages its own auto-dismiss timer.
- **`Toaster`** — fixed-position portal container at bottom (or top) center that stacks toasts.

### Guidelines
- Keep messages short — one sentence.
- Use an action button for the single most relevant response (e.g. "Undo").
- Auto-dismiss after 3 s by default; set `duration={0}` for persistent toasts.
- The timer pauses while the user hovers or focuses the toast.
- Do not use for errors that require user action — use **Dialog** or **Banner** instead.

Indeterminate loading indicator following the Adwaita spinner style.

### Guidelines
- Use to communicate that something is loading with an unknown duration.
- For a known duration, prefer the **Progress Bar** component instead.
- Keep spinners small and close to the content they represent.
- Always provide an accessible `label` (default: `"Loading…"`). Set `label=""` only when a visible sibling label describes the action.
- Respects `prefers-reduced-motion` — slows the animation instead of stopping it.

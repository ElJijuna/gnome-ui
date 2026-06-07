Container that fires layout changes when **its own width** crosses defined
thresholds — the CSS container-query equivalent of `AdwBreakpointBin`
(libadwaita 1.9 / GNOME 50).

### vs `useBreakpoint`
| | `useBreakpoint` | `BreakpointBin` |
|---|---|---|
| Watches | Viewport (`window.innerWidth`) | Container (`ResizeObserver`) |
| Use when | Layout depends on screen size | Layout depends on available space |
| Pattern | Hook — use inside components | Component — wraps content |

### How it works
- Breakpoints are sorted by `maxWidth` ascending.
- The **active breakpoint** is the smallest `maxWidth` ≥ the container's current width.
- Exposed as `data-breakpoint` on the wrapper `<div>` for CSS targeting.
- When wider than all thresholds, `activeBreakpoint` is `null`.

### CSS targeting
```css
.myCard[data-breakpoint="compact"] .layout { flex-direction: column; }
```

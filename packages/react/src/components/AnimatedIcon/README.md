Plays the CSS animation embedded in an `animated` icon from
[`@gnome-ui/icons`](https://www.npmjs.com/package/@gnome-ui/icons) — `Syncing`,
`Recording`, `Downloading`, `Connecting`. Rendered through plain `Icon`
instead, these show a static frame; `AnimatedIcon` is what turns the
animation on.

Mirrors GTK 4.22's `GtkSvg` in spirit: the animated markup lives in
trusted, package-authored icon data (never arbitrary user-supplied SVG),
and this component is just the play/pause switch on top of it.

### Guidelines
- Good fits: sync status, active recording, an in-progress download, a
  connection attempt — anywhere a small inline indicator beats a full
  `Spinner`.
- Set `playing` from real state (`isSyncing`, `isRecording`, …) rather than
  leaving it `true` forever — stop the animation once the state ends.
- Cross-fade between icons by keeping `playing` constant and swapping
  `icon` (e.g. `Connecting` → a static "connected" icon once acquired).

### Reduced motion
Always honored, regardless of `playing` — when the OS `prefers-reduced-motion`
setting is on, the animation stays paused even if `playing` is `true`. You
don't need to check `prefers-reduced-motion` yourself before setting `playing`.

### Usage
```tsx
import { AnimatedIcon } from "@gnome-ui/react";
import { Syncing } from "@gnome-ui/icons";

<AnimatedIcon icon={Syncing} playing={isSyncing} label="Syncing" />
```

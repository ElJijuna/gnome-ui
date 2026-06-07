Error state with four presets that set a default icon and title.
All defaults can be overridden via `icon` and `title` props.

Icon color uses `--gnome-warning-color` for `generic`/`network`
and `--gnome-error-color` for `permission`/`not-found`.

```tsx
import { ErrorState } from "@gnome-ui/layout";

<ErrorState
  type="network"
  description="Check your connection and try again."
  action={<Button variant="suggested" onClick={retry}>Try again</Button>}
/>
```

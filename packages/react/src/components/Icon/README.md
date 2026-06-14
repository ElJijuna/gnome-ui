Renders an [`@gnome-ui/icons`](https://www.npmjs.com/package/@gnome-ui/icons) definition as an inline SVG.

Icons are **framework-agnostic** path data objects — the `Icon` component is the React adapter.
Uses `currentColor` so the icon automatically inherits the parent's text color.

### Guidelines
- Pass `label` only when the icon stands alone (no sibling text). Otherwise omit it — the icon is marked `aria-hidden`.
- Use `size="sm"` (12 px) for dense UIs, `"md"` (16 px, default) for inline icons, `"lg"` (20 px) for standalone icons.
- Pair with `<Button variant="flat">` for icon buttons in header bars.

### Color
Pass `color` to apply a named GNOME palette token. Omit it (or use
`"default"`) to inherit `currentColor` from the parent.

Accepted values:
`"blue"` · `"green"` · `"yellow"` · `"orange"` ·
`"red"` · `"purple"` · `"brown"` · `"default"`

```tsx
<Icon icon={Search} color="blue" />
<Icon icon={Search} color="red" size="lg" />
<Icon icon={Search} /> {/* inherits currentColor */}
```

### Usage
```tsx
import { Icon } from "@gnome-ui/react";
import { Search } from "@gnome-ui/icons";

<Icon icon={Search} size="md" label="Search" />
```

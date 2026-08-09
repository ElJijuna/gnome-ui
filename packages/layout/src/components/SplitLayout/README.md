List/master + detail shell following the Adwaita `AdwNavigationSplitView`
pattern, with a `HeaderBar` for each pane — the way real Adwaita apps
(Settings, Files, Contacts) actually look, rather than the bare pane-toggle
mechanics of `@gnome-ui/react`'s `NavigationSplitView` that this composes.

On narrow screens (≤ 400 px) the detail pane's header automatically grows a
Back button wired to `onBack`, so consumers don't have to hand-build that
chrome themselves.

```tsx
import { SplitLayout } from "@gnome-ui/layout";

const [selected, setSelected] = useState<string | null>(null);

<SplitLayout
  sidebarTitle="Mail"
  sidebar={<MailList selected={selected} onSelect={setSelected} />}
  detailTitle={selected ?? undefined}
  detail={selected ? <MailDetail id={selected} /> : <EmptyState title="No message selected" />}
  showDetail={selected !== null}
  onBack={() => setSelected(null)}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebar` | `ReactNode` | — | Sidebar / list pane body content |
| `sidebarTitle` | `ReactNode` | — | Title in the sidebar pane's header bar |
| `sidebarActions` | `ReactNode` | — | Trailing actions in the sidebar pane's header bar |
| `detail` | `ReactNode` | — | Detail / content pane body content |
| `detailTitle` | `ReactNode` | — | Title in the detail pane's header bar |
| `detailActions` | `ReactNode` | — | Trailing actions in the detail pane's header bar |
| `showDetail` | `boolean` | `false` | Shows the detail pane instead of the sidebar on narrow screens |
| `onBack` | `() => void` | — | Called by the automatic mobile Back button. The button only renders when this is provided |
| `minSidebarWidth` | `number` | `180` | Minimum sidebar width in px |
| `maxSidebarWidth` | `number` | `280` | Maximum sidebar width in px |
| `sidebarWidthFraction` | `number` | `0.25` | Fraction of total width given to the sidebar (0–1) |

### Guidelines

- A pane's header bar only renders when it has a title, actions, or (for the
  detail pane) a visible Back button — an empty sidebar list doesn't grow a
  blank header.
- `showDetail`/`onBack` only matter on narrow screens; on wide screens both
  panes are always visible side by side and neither prop has any effect.
- For the raw pane-toggle primitive without header chrome, use
  `NavigationSplitView` from `@gnome-ui/react` directly.

# @gnome-ui/layout

Full-page application shell components following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), built on the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/layout)](https://www.npmjs.com/package/@gnome-ui/layout)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://eljijuna.github.io/gnome-ui/layout/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Live documentation: **[Storybook →](https://eljijuna.github.io/gnome-ui/layout/)**

## Installation

```bash
npm install @gnome-ui/layout
```

## Setup

Import the stylesheet once at the root of your app:

```tsx
// main.tsx or App.tsx
import "@gnome-ui/layout/styles";
```

## Tree-shaking

The package ships per-component entry points, so bundlers can eliminate unused components automatically:

```tsx
// Only Layout is included in the bundle
import { Layout } from "@gnome-ui/layout";
```

Per-component paths are also available:

```tsx
import { Layout } from "@gnome-ui/layout/components/Layout";
```

## Components

### `Layout`

Full-page application shell with four named, optional zones:

| Zone | Prop | Description |
|------|------|-------------|
| Top bar | `topBar` | Pinned header — typically a `Toolbar` or `HeaderBar`. Never scrolls. |
| Sidebar | `sidebar` | Fixed-width lateral navigation — typically a `Sidebar`. |
| Content | `children` | Scrollable main area. Fills remaining space. |
| Bottom bar | `bottomBar` | Pinned footer — typically a status `Toolbar`. Never scrolls. |

All props of `<div>` are forwarded to the root element.

#### Mobile sidebar overlay

On viewports narrower than **640 px** the sidebar becomes a slide-in overlay panel. Two additional props control its visibility:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebarOpen` | `boolean` | `false` | Whether the sidebar overlay is visible on mobile |
| `onSidebarClose` | `() => void` | — | Called when the user taps the backdrop — use it to set `sidebarOpen` back to `false` |

On wider (desktop) viewports the sidebar is always visible in the layout flow and these props are ignored.

```tsx
import { useState } from "react";
import { Layout } from "@gnome-ui/layout";
import "@gnome-ui/layout/styles";
import { Toolbar, Spacer, Button, Sidebar, SidebarSection, SidebarItem, Text } from "@gnome-ui/react";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout
      topBar={
        <Toolbar style={{ minHeight: 48, padding: "0 8px" }}>
          <Button
            variant="flat"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            ☰
          </Button>
          <Text variant="heading">My App</Text>
          <Spacer />
        </Toolbar>
      }
      sidebar={
        <Sidebar>
          <SidebarSection>
            <SidebarItem label="Home" active onClick={() => setSidebarOpen(false)} />
            <SidebarItem label="Settings" onClick={() => setSidebarOpen(false)} />
          </SidebarSection>
        </Sidebar>
      }
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
      bottomBar={
        <Toolbar style={{ minHeight: 36, padding: "0 16px" }}>
          <Text variant="caption" color="dim">Ready</Text>
        </Toolbar>
      }
    >
      <main style={{ padding: 24 }}>
        <Text variant="title-2">Welcome</Text>
      </main>
    </Layout>
  );
}
```

---

### `CounterCard`

Metric card with an animated numeric counter. Counts from `0` (or from the previous value) to `value` using an ease-out cubic curve. Respects `prefers-reduced-motion`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Text label shown above the value |
| `value` | `number` | — | Numeric target value |
| `prefix` | `string` | — | String prepended to the number (e.g. `"$"`) |
| `suffix` | `string` | — | String appended to the number (e.g. `" files"`) |
| `decimals` | `number` | `0` | Decimal places to display |
| `format` | `(n: number) => string` | — | Custom formatter; overrides `decimals` |
| `animated` | `boolean` | `true` | Animate the counter on mount and value change |
| `duration` | `number` | `1000` | Animation duration in ms |
| `accent` | `boolean` | `false` | Render the value in the accent color |
| `interactive` | `boolean` | `false` | Make the card clickable |

```tsx
import { CounterCard } from "@gnome-ui/layout";

<CounterCard label="Documents" value={1248} suffix=" files" />
<CounterCard label="Revenue"   value={9420} prefix="$" accent duration={1500} />
```

---

### `UserCard`

User identity panel for popovers, sidebar footers, and profile pages. Renders an `Avatar`, a display name, an optional sub-line, and a list of action buttons. A separator is automatically inserted before the first `"destructive"` action when non-destructive actions precede it.

The component has **no card chrome** — place it inside a `Popover` or wrap it in `<Card>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Display name; also drives avatar initials and color |
| `email` | `string` | — | Optional secondary line |
| `avatarSrc` | `string` | — | Avatar image URL; falls back to initials |
| `avatarColor` | `AvatarColor` | — | Override the auto-derived avatar color |
| `avatarSize` | `AvatarSize` | `"md"` | Avatar size |
| `actions` | `UserCardAction[]` | `[]` | Action buttons; use `variant: "destructive"` for danger actions |
| `minWidth` | `number` | `200` | Minimum card width in px |

```tsx
import { UserCard } from "@gnome-ui/layout";

<UserCard
  name="Ada Lovelace"
  email="ada@gnome.org"
  actions={[
    { label: "View Profile",     onClick: () => {} },
    { label: "Account Settings", onClick: () => {} },
    { label: "Sign Out",         onClick: () => {}, variant: "destructive" },
  ]}
/>
```

---

### `PanelCard`

Card with a structured **header / body / footer** layout and built-in collapse/expand behaviour.

The expanded state is managed internally. Control it imperatively via a `ref`:

```tsx
import { useRef } from "react";
import { PanelCard } from "@gnome-ui/layout";
import type { PanelCardHandle } from "@gnome-ui/layout";

const ref = useRef<PanelCardHandle>(null);

// Drive from anywhere in the parent:
ref.current?.expand();
ref.current?.collapse();
ref.current?.toggle();
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | Primary title shown in the header |
| `icon` | `ReactNode` | — | Leading icon in the header |
| `headerActions` | `ReactNode` | — | Controls at the trailing edge of the header, before the chevron |
| `defaultExpanded` | `boolean` | `true` | Initial expanded state |
| `collapsible` | `boolean` | `true` | Show the chevron toggle; set `false` to lock the panel open |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Notification callback — fires on every state transition |
| `children` | `ReactNode` | — | Body content (collapsed/expanded with the panel) |
| `footer` | `ReactNode` | — | Leading content in the footer bar (feedback text, badge…) |
| `footerActions` | `ReactNode` | — | Trailing controls in the footer bar |

The footer bar is only rendered when at least one of `footer` or `footerActions` is provided.

#### Ref handle

| Method | Description |
|--------|-------------|
| `expand()` | Expand the panel |
| `collapse()` | Collapse the panel |
| `toggle()` | Toggle between expanded and collapsed |

```tsx
import { Icon, Button, Text } from "@gnome-ui/react";
import { FolderOpen } from "@gnome-ui/icons";
import { PanelCard } from "@gnome-ui/layout";
import type { PanelCardHandle } from "@gnome-ui/layout";

const panelRef = useRef<PanelCardHandle>(null);

<PanelCard
  ref={panelRef}
  icon={<Icon icon={FolderOpen} />}
  title="Project Files"
  headerActions={<Button variant="flat" size="sm">Rename</Button>}
  onExpandedChange={(open) => console.log("panel:", open)}
  footer={<Text variant="caption" color="dim">Last modified: 2 min ago</Text>}
  footerActions={<Button variant="suggested" size="sm">Save</Button>}
>
  <p>Panel body content here</p>
</PanelCard>
```

---

### `DashboardGrid`

Responsive CSS Grid container for arranging dashboard widgets and panels.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `1 \| 2 \| 3 \| 4 \| "auto"` | `"auto"` | Column count. `"auto"` fills columns with `minmax(280px, 1fr)`. |
| `gap` | `"sm" \| "md" \| "lg"` | `"md"` | Gap between items (8 / 16 / 24 px). |
| `children` | `ReactNode` | — | `DashboardGrid.Item` elements. |

#### `DashboardGrid.Item` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `span` | `1 \| 2 \| 3 \| 4` | `1` | Number of columns the item spans. |
| `children` | `ReactNode` | — | Widget content. |

Both `DashboardGrid` and `DashboardGrid.Item` forward all `<div>` props
to their root element.

```tsx
import { DashboardGrid } from "@gnome-ui/layout";

<DashboardGrid columns={3} gap="md">
  <DashboardGrid.Item span={2}>
    <StatCard />
  </DashboardGrid.Item>
  <DashboardGrid.Item>
    <ProgressCard />
  </DashboardGrid.Item>
</DashboardGrid>
```

---

### `QuickActions`

Grid of shortcut action buttons for dashboards, file managers, and control panels.
Actions are keyboard navigable with arrow keys, and disabled actions are skipped
and cannot be activated.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `QuickAction[]` | — | Shortcut action definitions |
| `columns` | `number` | `4` | Number of grid columns |

#### `QuickAction`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Stable action id |
| `label` | `string` | Visible button label |
| `icon` | `ReactNode` | Icon or visual element. Size and color are controlled by the node you pass in. |
| `disabled` | `boolean` | Visually disables the action and blocks activation |
| `onActivate` | `() => void` | Called when the action is clicked or activated from the keyboard |

```tsx
import { Add, Save, Share } from "@gnome-ui/icons";
import { Icon } from "@gnome-ui/react";
import { QuickActions } from "@gnome-ui/layout";

<QuickActions
  columns={3}
  actions={[
    {
      id: "new-file",
      label: "New File",
      icon: <Icon icon={Add} size="lg" />,
      onActivate: () => {},
    },
    {
      id: "save",
      label: "Save",
      icon: <Icon icon={Save} size="lg" />,
      onActivate: () => {},
    },
    {
      id: "share",
      label: "Share",
      icon: <Icon icon={Share} size="lg" />,
      disabled: true,
      onActivate: () => {},
    },
  ]}
/>
```

## License

[MIT](../../LICENSE)

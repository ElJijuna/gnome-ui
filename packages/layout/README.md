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

## Formatting

Numeric layout components such as `CounterCard` and `StatCard` inherit locale and default number formatting from `GnomeProvider` in `@gnome-ui/react`.

```tsx
import { GnomeProvider } from "@gnome-ui/react";
import { CounterCard } from "@gnome-ui/layout";

<GnomeProvider
  locale="en-US"
  numberFormat={{ notation: "compact", compactDisplay: "short" }}
>
  <CounterCard label="Downloads" value={12500} />
</GnomeProvider>
```

Use compact notation for values like `13K`; omit `numberFormat` or use `notation: "standard"` for full values like `12,500`. A component-level `format` prop, where available, still takes precedence.

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
| Header | `header` / `topBar` | Pinned header — typically a `Toolbar`, `HeaderBar`, or app header composition. Never scrolls when `scroll="content"`. |
| Sidebar | `sidebar` | Fixed-width lateral navigation — typically a `Sidebar`. |
| Content | `children` | Scrollable main area. Fills remaining space. |
| Footer | `footer` / `bottomBar` | Pinned footer — typically a status `Toolbar`. Never scrolls when `scroll="content"`. |

All props of `<div>` are forwarded to the root element.

`topBar` and `bottomBar` remain supported for existing apps. New code can use
the shell-style aliases `header` and `footer`; the legacy names take precedence
when both are provided.

#### Height and scroll modes

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `"viewport" \| "parent"` | `"viewport"` | `viewport` fills the browser viewport (`100vh`); `parent` fills the containing element (`100%`) for nested layouts. |
| `scroll` | `"content" \| "page" \| "none"` | `"content"` | `content` scrolls only the main area; `page` lets the whole shell scroll; `none` disables internal scrolling. |

#### Mobile sidebar overlay

On narrow viewports the sidebar becomes a slide-in overlay panel. The default
breakpoint is **400 px**, matching GNOME split-view behaviour.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebarOpen` | `boolean` | `false` | Whether the sidebar overlay is visible on mobile |
| `onSidebarClose` | `() => void` | — | Called when the user taps the backdrop — use it to set `sidebarOpen` back to `false` |
| `onSidebarOpenChange` | `(open, reason) => void` | — | Called for shell-driven open changes such as backdrop and Escape |
| `sidebarPlacement` | `"start" \| "end"` | `"start"` | Places the sidebar on the leading or trailing edge |
| `sidebarLabel` | `string` | — | Accessible label for the sidebar landmark wrapper |
| `sidebarBreakpoint` | `"narrow" \| "medium" \| "wide"` | `"narrow"` | Overlay threshold: `400`, `550`, or `860` px |
| `sidebarCollapseMode` | `"none" \| "rail" \| "overlay"` | `"none"` | Wide-layout collapse behaviour |
| `sidebarCollapsed` | `boolean` | `false` | Applies shell-level collapsed sidebar styling |
| `sidebarCollapsedWidth` | `number` | `56` | Rail width in pixels |

On wider viewports the sidebar stays in layout flow unless
`sidebarCollapseMode="overlay"` and `sidebarCollapsed` are both set.

When the sidebar overlay is open, focus moves into the sidebar, `Tab` and
`Shift+Tab` remain inside it, and `Escape` requests close through
`onSidebarOpenChange(false, "escape")`. Add `sidebarLabel` when the sidebar
content does not provide a labelled `nav`.

```tsx
import { useState } from "react";
import {
  AppHeader,
  Layout,
  PageContent,
  SidebarShell,
  SidebarTrigger,
  StatusBar,
} from "@gnome-ui/layout";
import "@gnome-ui/layout/styles";
import { SidebarSection, SidebarItem, Text } from "@gnome-ui/react";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Layout
      header={
        <AppHeader
          title="My App"
          leading={
            <SidebarTrigger
              sidebarOpen={sidebarOpen}
              sidebarCollapsed={sidebarCollapsed}
              onSidebarOpenChange={setSidebarOpen}
              onSidebarCollapsedChange={setSidebarCollapsed}
            />
          }
        />
      }
      sidebar={
        <SidebarShell
          header={<Text variant="heading">My App</Text>}
          collapsed={sidebarCollapsed}
        >
          <SidebarSection>
            <SidebarItem label="Home" active onClick={() => setSidebarOpen(false)} />
            <SidebarItem label="Settings" onClick={() => setSidebarOpen(false)} />
          </SidebarSection>
        </SidebarShell>
      }
      sidebarOpen={sidebarOpen}
      sidebarCollapsed={sidebarCollapsed}
      sidebarCollapseMode="rail"
      onSidebarClose={() => setSidebarOpen(false)}
      footer={
        <StatusBar>
          <Text variant="caption" color="dim">Ready</Text>
        </StatusBar>
      }
    >
      <PageContent as="section" maxWidth="lg">
        <Text variant="title-2">Welcome</Text>
      </PageContent>
    </Layout>
  );
}
```

#### Shell API improvements

The current shell API adds a few improvements over the original
`topBar`/`bottomBar` composition:

- `header` and `footer` aliases make shell regions read naturally while keeping
  `topBar` and `bottomBar` compatible with existing apps.
- `height="parent"` makes nested shells possible without accidental double
  `100vh` layouts.
- `scroll="content"` keeps header/footer/sidebar fixed while only the main area
  scrolls.
- `sidebarBreakpoint`, `sidebarPlacement`, and `sidebarCollapseMode` cover
  narrow overlays, right-side panels, and icon-only rail sidebars.
- `SidebarTrigger` coordinates the same button with overlay open state on
  narrow screens and rail collapse on wider screens.
- Overlay sidebars move focus inside, trap `Tab`/`Shift+Tab`, close with
  `Escape`, and restore focus to the previous trigger.

---

### `SidebarShell`

Full-height sidebar composition for `Layout.sidebar`. It wraps the GNOME
`Sidebar` with optional fixed header/footer areas and a scrollable navigation
middle.

| Prop | Type | Description |
|------|------|-------------|
| `header` | `ReactNode` | Fixed content above the navigation list. |
| `children` | `ReactNode` | Navigation content, usually `SidebarSection` children. |
| `footer` | `ReactNode` | Fixed content below the navigation list. |

All `Sidebar` props such as `collapsed`, `searchable`, `filter`, `mode`, and
`variant` pass through.

```tsx
import { SidebarShell } from "@gnome-ui/layout";
import { SidebarSection, SidebarItem, Text } from "@gnome-ui/react";

<SidebarShell header={<Text variant="heading">Files</Text>} searchable>
  <SidebarSection>
    <SidebarItem label="Home" active />
    <SidebarItem label="Starred" />
  </SidebarSection>
</SidebarShell>
```

---

### `SidebarTrigger`

Header button that toggles the sidebar using the current layout mode. On
overlay breakpoints it opens or closes the panel; on wider screens it toggles
rail collapse.

| Prop | Type | Description |
|------|------|-------------|
| `sidebarOpen` | `boolean` | Current overlay-open state. |
| `sidebarCollapsed` | `boolean` | Current rail-collapsed state. |
| `sidebarBreakpoint` | `"narrow" \| "medium" \| "wide"` | Same breakpoint used by `Layout`. |
| `onSidebarOpenChange` | `(open, reason) => void` | Called when the trigger changes overlay state. |
| `onSidebarCollapsedChange` | `(collapsed) => void` | Called when the trigger changes rail collapse. |

```tsx
import { SidebarTrigger } from "@gnome-ui/layout";

<SidebarTrigger
  sidebarOpen={sidebarOpen}
  sidebarCollapsed={sidebarCollapsed}
  onSidebarOpenChange={setSidebarOpen}
  onSidebarCollapsedChange={setSidebarCollapsed}
/>
```

---

### `AppHeader`

Opinionated application header for `Layout.header`. It keeps the GNOME
`HeaderBar` shape while exposing shell-friendly slots.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `ReactNode` | Header title. String titles render with `WindowTitle`. |
| `subtitle` | `string` | Optional subtitle for string titles. |
| `leading` | `ReactNode` | Leading controls, usually sidebar/back buttons. |
| `navigation` | `ReactNode` | Optional top-level navigation such as `ViewSwitcher`. |
| `search` | `ReactNode` | Optional search control. |
| `actions` | `ReactNode` | Trailing actions, usually flat icon buttons or menus. |
| `flat` | `boolean` | Blend the header into the window chrome. |

```tsx
import { AppHeader } from "@gnome-ui/layout";
import { Button, SearchBar } from "@gnome-ui/react";

<AppHeader
  title="Files"
  subtitle="Home"
  leading={<Button variant="flat" aria-label="Toggle sidebar">☰</Button>}
  search={<SearchBar inline open aria-label="Search files" />}
  actions={<Button variant="flat">New Folder</Button>}
/>
```

---

### `PageContent`

Scrollable page body for `Layout.children`. It provides GNOME page padding and
optional Adwaita `Clamp` behaviour for readable widths.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `ElementType` | `"main"` | Element to render. Use `section` when nested inside another `main`. |
| `maxWidth` | `"none" \| "sm" \| "md" \| "lg" \| "xl" \| number` | `"none"` | Optional content clamp. |
| `padding` | `"none" \| "compact" \| "normal" \| "spacious"` | `"normal"` | Responsive page padding. |

```tsx
import { PageContent } from "@gnome-ui/layout";

<PageContent as="section" maxWidth="lg">
  ...
</PageContent>
```

---

### `StatusBar`

Compact footer/status bar for `Layout.footer`.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Leading status content. |
| `trailing` | `ReactNode` | Optional trailing status or actions. |

```tsx
import { StatusBar } from "@gnome-ui/layout";

<StatusBar trailing="GNOME Files 48.0">
  1,248 items
</StatusBar>
```

---

### `IconBadge`

Rounded-square tinted icon container. Accepts the seven gnome-ui named colors or any hex value (`#rgb` / `#rrggbb`). In both cases the background is rendered at 15% opacity.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `"blue" \| "green" \| "yellow" \| "orange" \| "red" \| "purple" \| "brown" \| string` | — | Named color token or any hex value. Omit for a neutral grey background. |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Badge size |
| `children` | `ReactNode` | — | Icon, emoji, or any inline content |

All `<div>` props are forwarded to the root element.

```tsx
import { IconBadge } from "@gnome-ui/layout";
import { Icon } from "@gnome-ui/react";
import { GoHome } from "@gnome-ui/icons";

// Named color token
<IconBadge color="blue" size="lg">🚀</IconBadge>

// Arbitrary hex — same 15% tinted background
<IconBadge color="#6c8ebf" size="md"><Icon icon={GoHome} size="sm" /></IconBadge>
<IconBadge color="#ddd" size="sm">📄</IconBadge>

// No color — neutral grey overlay
<IconBadge size="md">📄</IconBadge>
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

### `StatCard`

Key metric card with optional unit, trend indicator, icon, and skeleton loading
state. Use it for dashboard metrics that need context beyond a raw count.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Metric label |
| `value` | `number \| string` | — | Primary value |
| `unit` | `string` | — | Optional unit suffix |
| `trend` | `{ direction: "up" \| "down" \| "neutral"; value: number; period?: string }` | — | Optional trend indicator |
| `icon` | `ReactNode` | — | Optional visual element. Size and color are controlled by the node you pass in. |
| `loading` | `boolean` | `false` | Render a skeleton placeholder state |

```tsx
import { Person } from "@gnome-ui/icons";
import { Icon } from "@gnome-ui/react";
import { StatCard } from "@gnome-ui/layout";

<StatCard
  label="Active Users"
  value={1284}
  unit="users"
  icon={<Icon icon={Person} size="lg" />}
  trend={{ direction: "up", value: 12, period: "vs last week" }}
/>
```

Per-component path:

```tsx
import { StatCard } from "@gnome-ui/layout/components/StatCard";
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
| `columns` | `1 \| 2 \| 3 \| 4 \| "auto" \| ResponsiveColumns` | `"auto"` | Column count. `"auto"` fills columns with `minmax(280px, 1fr)`. Objects map breakpoints to explicit counts. |
| `gap` | `"sm" \| "md" \| "lg"` | `"md"` | Gap between items using core spacing tokens (`--gnome-space-2/3/4`). |
| `layout` | `"grid" \| "column"` | `"grid"` | Render as a grid or as a vertical stack. |
| `children` | `ReactNode` | — | `DashboardGrid.Item` elements. |

#### Responsive columns

| Key | Width |
|-----|-------|
| `sm` | Base / small screens |
| `md` | `≥ 550px` |
| `lg` | `≥ 860px` |
| `xl` | `≥ 1200px` |

#### `DashboardGrid.Item` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `span` | `1 \| 2 \| 3 \| 4` | `1` | Number of columns the item spans in grid mode. Harmless in column mode. |
| `children` | `ReactNode` | — | Widget content. |

Both `DashboardGrid` and `DashboardGrid.Item` forward all `<div>` props
to their root element.

```tsx
import { DashboardGrid } from "@gnome-ui/layout";

<DashboardGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap="md">
  <DashboardGrid.Item span={2}>
    <StatCard />
  </DashboardGrid.Item>
  <DashboardGrid.Item>
    <ProgressCard />
  </DashboardGrid.Item>
</DashboardGrid>
```

```tsx
<DashboardGrid layout="column" gap="md">
  <DashboardGrid.Item>
    <StatCard />
  </DashboardGrid.Item>
  <DashboardGrid.Item>
    <ActivityFeed />
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

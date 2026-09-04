# @gnome-ui/react-native

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

React Native component library following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), targeting iOS/Android/GNOME-mobile shells.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react-native)](https://www.npmjs.com/package/@gnome-ui/react-native)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

> **Status:** theme tokens, `GnomeProvider`, Tier 1 Base (`Button`, `Text`,
> `Link`, `TextField`, `Switch`, `Checkbox`, `RadioButton`), Tier 2 Layout &
> Containers (`Separator`, `Card`, `BoxedList`, `ActionRow`, `HeaderBar`),
> and Tier 3 Navigation (`Tabs`, `ViewSwitcher`, `Sidebar`, `SearchBar`,
> `PathBar`) fully ported. Tier 4 Feedback: `Spinner`, `ProgressBar`,
> `Skeleton`, `Toast`/`Toaster`, `Banner`, `Dialog`, `Tooltip`, and
> `AnimatedIcon` (which brought a new `Icon` component along with it, as its
> own public component) shipped — `Status Page` skipped for now. Tier 5
> Advanced Controls in progress: `Dropdown` and `Slider` shipped —
> `Spin Button`, `Avatar`, `Badge`, and `Popover` remain. Component
> ports from `@gnome-ui/react` continue tier by tier. See
> [ROADMAP.md](../../ROADMAP.md) Priority 3.

## How it works

Bare React Native — no Expo SDK dependency, so the package works in both
Expo-managed and bare RN apps. Components are rebuilt with native primitives
(`View`, `Text`, `Pressable`, `StyleSheet`) rather than ported 1:1 from
`@gnome-ui/react`'s DOM-based JSX, but mirror its component API/props where
the platforms overlap.

## Theme tokens

`scripts/generate-theme.mjs` parses `@gnome-ui/core`'s `src/tokens.css` with
`postcss` and emits `src/theme/tokens.generated.ts` — four plain JS objects
(`lightTheme`, `darkTheme`, `highContrastTheme`, `highContrastDarkTheme`),
one per `@media (prefers-color-scheme)` / `@media (prefers-contrast)`
combination in the source CSS. `var()` chains are resolved at generation
time following the same cascade order as the CSS (base → dark → high
contrast → high contrast + dark), so each object is a flat, fully-resolved
map — no runtime CSS engine needed.

Units are converted to what RN styles expect: `px`/`rem` lengths become bare
dp numbers (1rem = 16), `ms` durations become numbers, modern
`rgb(r g b / a)` colors become `rgba(r, g, b, a)` strings, `cubic-bezier()`
becomes a 4-number array, and a font stack like `"Adwaita Sans", cantarell,
…` is reduced to just `"Adwaita Sans"` (RN's `fontFamily` takes one native
family name — the app still has to load `@gnome-ui/core`'s `.ttf` files).

`oklch()` (unsupported by RN's color parser), `box-shadow` strings, and the
two `clamp()`-based sidebar-width tokens aren't auto-converted — they're
still available, unconverted, in the matching `*RawTokens` export (e.g.
`lightRawTokens['--gnome-shadow-md']`) so nothing is silently lost.

Pick a variant at runtime with `resolveGnomeTheme`:

```ts
import { resolveGnomeTheme } from '@gnome-ui/react-native';
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme() ?? 'light';
const theme = resolveGnomeTheme({ colorScheme, contrast: 'normal' });

theme.accentColor; // '#3584e4'
theme.space2; // 12
```

The generated file is committed, but always regenerate it after changing
`@gnome-ui/core`'s tokens — `npm run theme:generate`, or just run `build`
/ `typecheck` / `test`, which each regenerate it first.

## GnomeProvider

RN has no CSS cascade, so components can't read a custom-property-style
theme the way `@gnome-ui/react`'s components do — they need the resolved
theme object handed to them directly. `GnomeProvider` computes it once and
exposes it (plus locale, direction, and formatting defaults) via context:

```tsx
import { GnomeProvider, useGnomeTheme } from '@gnome-ui/react-native';
import { Text, View } from 'react-native';

function App() {
  return (
    <GnomeProvider accentColor="green">
      <Screen />
    </GnomeProvider>
  );
}

function Screen() {
  const theme = useGnomeTheme();

  return (
    <View style={{ backgroundColor: theme.windowBgColor, padding: theme.space4 }}>
      <Text style={{ color: theme.windowFgColor, fontSize: theme.fontSizeBody }}>Hello</Text>
    </View>
  );
}
```

`colorScheme` and `contrast` both default to `"system"`: color scheme
follows `useColorScheme()`/`Appearance`, and contrast follows the OS
accessibility setting where one exists — Android's "High text contrast",
iOS's "Increase Contrast" — falling back to `"normal"` elsewhere (e.g. web).
Pass `"light"`/`"dark"` or `"normal"`/`"more"` to override either
explicitly.

`accentColor` accepts a named Adwaita palette color (`"green"`, `"red"`,
…) — resolved to the matching shade for the active color scheme, same as
`@gnome-ui/react` — or any RN color string. It's threaded through
`theme.accentColor`/`theme.accentBgColor` (and `theme.focusRingColor`
outside high contrast, which keeps its own fixed value there for maximum
contrast, matching `tokens.css`).

Other hooks: `useLocale`, `useDir`, `useNumberFormatter`,
`useDateTimeFormatter`, `useColorScheme`/`useResolvedColorScheme`,
`useContrast`/`useResolvedContrast`, `useAccentColor` — each reads one slice
of the same context, mirroring `@gnome-ui/react`'s `GnomeProvider` hook set.

Unlike the web provider, `dir` is exposed for consumers to branch on but
never calls `I18nManager.forceRTL()` — RN's layout direction is a single
global flag that needs an app reload and is set once at bootstrap, not per
provider tree.

`useReducedMotion()` is the one hook in this set **not** scoped to
`GnomeProvider`'s context — it reads the OS "Reduce Motion" accessibility
setting (`AccessibilityInfo.isReduceMotionEnabled`/`reduceMotionChanged`,
supported on both iOS and Android) directly and works without a provider
at all. Unlike `contrast`/`colorScheme`, the web `GnomeProvider` has no
corresponding override prop for this — `prefers-reduced-motion` is a pure
CSS media query there, always OS-driven — so there's nothing to mirror on
the context side. Any component with a continuously looping `Animated`
value (e.g. `Spinner`) reads it to slow down or skip that animation.

## Components

### Button

```tsx
import { Button } from '@gnome-ui/react-native';

<Button variant="suggested" onPress={() => save()}>
  Save
</Button>;
```

Mirrors `@gnome-ui/react`'s `Button` props (`variant`, `size`, `shape`, `osd`,
`leadingIcon`/`trailingIcon`), rebuilt on `Pressable` — hover/`:active` CSS
states become the `pressed` render-prop, and `filter: brightness()` (not
available in RN) becomes a `0.85` opacity dip on press for the solid
`suggested`/`destructive` variants. `leadingIcon`/`trailingIcon` render
as-is: RN has no `currentColor` equivalent, so size and color icons
yourself, matching the resolved label color (`theme.accentFgColor`,
`theme.destructiveFgColor`, `theme.windowFgColor`, …) if you want them to
match.

### Text

```tsx
import { Text } from '@gnome-ui/react-native';

<Text variant="title-1">Settings</Text>
<Text variant="caption" color="dim">Last synced 5 minutes ago</Text>;
```

All 12 Adwaita text styles — `large-title`, `title-1`–`title-4`, `heading`,
`body`, `document`, `caption`, `caption-heading`, `monospace`, `numeric` —
and the same 7 semantic colors as `@gnome-ui/react` (`default`, `dim`,
`accent`, `destructive`, `success`, `warning`, `error`).

| Variant | Role | Use case |
|---------|------|----------|
| `large-title` | `header` | Display heading with lots of whitespace |
| `title-1` | `header` | Primary screen title |
| `title-2` | `header` | Section title |
| `title-3` | `header` | Sub-section title |
| `title-4` | `header` | Minor heading |
| `heading` | `header` | UI labels, boxed list headers |
| `body` | — | Default UI text, descriptions |
| `document` | — | Reading content (chat, articles) |
| `caption` | — | Sub-text, metadata |
| `caption-heading` | — | Small group labels (uppercase) |
| `monospace` | — | Code, logs, shell commands |
| `numeric` | — | Aligned numbers, counters |

RN has no element to choose, so `@gnome-ui/react`'s `as` prop is replaced by
`accessibilityRole`: the six heading variants default to `"header"` — the
native equivalent of `<h1>`–`<h4>`, and what the VoiceOver/TalkBack heading
rotor reads — and passing `accessibilityRole` explicitly overrides that.

Three CSS-only typography features are resolved at render time instead:
relative `line-height` ratios and `em` letter-spacing become absolute dp
against each variant's own font size (RN accepts nothing else), and
`color="dim"` stays an *opacity* rather than a flat gray, so it keeps
working over any background — exactly what `.color-dim` does on the web.

Everything else is plain RN `Text`: `numberOfLines`, `selectable`,
`onPress`, `adjustsFontSizeToFit` and the rest of `TextProps` pass straight
through, `style` merges over the variant style, and `ref` reaches the
underlying host `Text`.

### Link

```tsx
import { Link } from '@gnome-ui/react-native';

<Link href="https://gnome.org" external>
  GNOME
</Link>;
```

`href` is opened via `Linking.openURL` when pressed. Pass a custom `onPress`
to hand it to a router instead (e.g. `navigation.navigate` for an internal
link) — that fully replaces the default `Linking.openURL` call rather than
running alongside it.

RN's `Pressable` has no `:hover`, so the underline the web `Link` reveals on
hover instead reveals on press — the closest native equivalent — alongside
the same `0.7` press-opacity dip as `@gnome-ui/react`'s `:active` state.

`external` appends a trailing ↗ indicator and sets an `"Opens in browser"`
accessibility hint on the pressable; the indicator itself is hidden from
accessibility (`accessibilityElementsHidden`) since the hint already
announces the same thing, mirroring the web version's `aria-label` on its
icon span. Unlike the web `Link`, RN has no tab concept, so `external` is
purely presentational — `href` always opens the same way regardless.

### TextField

```tsx
import { TextField } from '@gnome-ui/react-native';

<TextField
  label="Username"
  helperText="Enter your username"
  value={username}
  onChangeText={setUsername}
/>;

<TextField label="Email" error="This field is required" />;
```

RN has no `<label htmlFor>`/`aria-describedby` pairing, so `label` doubles
as `accessibilityLabel` and `error`/`helperText` doubles as
`accessibilityHint` on the underlying `TextInput` — announced together the
same way `aria-describedby` reads them on the web. `error`, when set,
replaces `helperText` in both the rendered hint row and the accessibility
hint, and colors the border and hint text with `theme.errorColor`.

There's no `:focus-visible` distinction on RN, so the accent border on
focus is plain `onFocus`/`onBlur` state rather than a keyboard-only ring;
there's also no outer `box-shadow`, so focus is a border-color change only,
not a grown ring like the web version's. The web `disabled` prop is RN's
own `editable={false}` — mirrored as a dimmed wrapper (label, input, and
hint together), matching `@gnome-ui/react`'s `.disabled` wrapper class.

`style` targets the wrapping `View`; `inputStyle` targets the `TextInput`
itself. Everything else (`value`, `onChangeText`, `placeholder`,
`keyboardType`, `secureTextEntry`, …) is plain RN `TextInputProps`, and
`ref` reaches the underlying `TextInput`.

### Switch

```tsx
import { useState } from 'react';
import { Switch } from '@gnome-ui/react-native';

function WifiRow() {
  const [enabled, setEnabled] = useState(true);

  return <Switch value={enabled} onValueChange={setEnabled} accessibilityLabel="Wi-Fi" />;
}
```

Rebuilt on `Pressable`/`Animated.View` rather than ported from
`@gnome-ui/react`'s `<input type="checkbox" role="switch">`: RN has no
checkbox primitive to skin, and the platform-supplied `Switch` can't be
made to match Adwaita, so the track and thumb are drawn by hand.
`value`/`onValueChange` (not `checked`/`onChange`) mirror RN's own `Switch`
API instead — the ecosystem convention this component overlaps with. It's
fully controlled: there's no `defaultValue` escape hatch, matching the
platform's own `Switch`.

Track background and border color animate on every `value` change after
the initial mount — matching the CSS `transition` on `.switch` — using
`theme.durationFast`/`theme.easingDefault`; the thumb's fill color does not
animate, since the source CSS only transitions the thumb's `transform`, not
its `background-color`.

Two of `Switch.module.css`'s colors are hardcoded per color scheme inside a
component-level `@media (prefers-color-scheme: dark)` block rather than
driven by a semantic token. Unlike `Button`/`Link`/`TextField`, which each
read a single token that already resolves correctly per theme, the
unchecked track/thumb colors here branch explicitly on
`useResolvedColorScheme()` to match.

### Checkbox

```tsx
import { useState } from 'react';
import { Checkbox } from '@gnome-ui/react-native';

function TermsRow() {
  const [accepted, setAccepted] = useState(false);

  return (
    <Checkbox value={accepted} onValueChange={setAccepted} accessibilityLabel="Accept terms" />
  );
}

// "Select all" with a mixed group:
<Checkbox value={allSelected} indeterminate={someSelected && !allSelected} onValueChange={selectAll} />;
```

Three states — unchecked, checked, and `indeterminate` (mixed) — same as
`@gnome-ui/react`'s. `value`/`onValueChange` mirror `Switch`'s convention
rather than the web version's `checked`/`onChange`.

RN has no `indeterminate` DOM property to set imperatively — the entire
reason the web version needs a ref and an effect — so here it's just a
render branch: `indeterminate` draws a short bar, otherwise a checkmark,
both fading in on the same `Animated.Value` that drives the border/
background transition. The checkmark itself is a `✓` glyph rather than the
web version's `clip-path` polygon, since this package has no SVG dependency
to draw one exactly — the same Unicode-glyph fallback `Link`'s external-link
indicator already established for a small decorative mark.

The idle border color is another case (like `Switch`) where the source CSS
hardcodes a palette swatch per color scheme rather than a token that
already resolves per theme, so it branches on `useResolvedColorScheme()` —
and on `useResolvedContrast()` for the high-contrast border color/width —
to match.

### RadioButton

```tsx
import { useState } from 'react';
import { RadioButton } from '@gnome-ui/react-native';

function SizeOptions() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');

  return (
    <>
      {(['sm', 'md', 'lg'] as const).map((option) => (
        <RadioButton
          key={option}
          value={size === option}
          onSelect={() => setSize(option)}
          accessibilityLabel={option}
        />
      ))}
    </>
  );
}
```

Reuses `Checkbox`'s exact border/background transition technique — same
`Animated.Value`, same mount-skip guard so it never animates before the
user touches it, same `useResolvedColorScheme()`/`useResolvedContrast()`
branching for the idle border color — just circular, with a filled dot
instead of a checkmark, and no indeterminate state.

The web version's `<input type="radio" name="...">` groups mutually
exclusive options natively via the shared `name` attribute; RN has no
equivalent, so grouping is fully manual — render one `RadioButton` per
option and drive `value` from shared selection state in the parent, same
as any other controlled list of options. `onSelect` (not `onValueChange`)
only fires when pressed while unselected, matching native radio semantics:
pressing an already-selected radio is a no-op, so there's no boolean to
report back.

### Separator

```tsx
import { Separator } from '@gnome-ui/react-native';

<Separator />;
<Separator orientation="vertical" style={{ height: 24 }} />;
```

Thin dividing line — the first component from Tier 2 (Layout &
Containers). Color comes entirely from `theme.cardShadeColor`, which
already resolves correctly per color scheme, so — unlike `Switch`/
`Checkbox`/`RadioButton` — there's no `useResolvedColorScheme()` branching
needed here.

Rebuilt as a plain `View` rather than ported from `@gnome-ui/react`'s
`<hr>`/`<div role="separator">`: RN's `AccessibilityRole` union has no
`"separator"` value, so — since a divider carries no information a screen
reader user needs — it's excluded from the accessibility tree entirely
with `accessible={false}`, the RN-idiomatic way to mark a purely
decorative element.

### Sidebar

```tsx
import { Sidebar, SidebarItem, SidebarSection } from '@gnome-ui/react-native';

<Sidebar>
  <SidebarSection title="Mailboxes">
    <SidebarItem label="Inbox" icon={<InboxIcon />} active onPress={() => go('inbox')} />
    <SidebarItem label="Starred" icon={<StarIcon />} suffix={<Text variant="caption">3</Text>} />
  </SidebarSection>
  <SidebarSection title="Labels" collapsible>
    <SidebarItem label="Work" />
    <SidebarItem label="Archived" disabled />
  </SidebarSection>
</Sidebar>;

// Rail (icon-only) mode:
<Sidebar collapsed>…</Sidebar>;

// Controlled filtering — pair with your own search input:
<Sidebar filter={query}>…</Sidebar>;
```

Lateral navigation panel. Consecutive top-level children (typically
`SidebarSection`s) get a `Separator` inserted between them — the same
divider-on-index-boundary technique `BoxedList` uses for its rows — standing
in for the web version's `.section + .section` adjacent-sibling CSS rule,
which RN has no equivalent of. A child that `filter` hides is excluded from
that index count too, so a lone visible row never ends up sandwiched between
two stray dividers.

`SidebarSection` is `collapsible` via its header `Pressable` or imperatively
through a `ref` (`expand`/`collapse`/`toggle`) — the body stays mounted and
toggles `display: 'none'` rather than unmounting, the same "stays mounted
but hidden" approach `TabPanel` uses, instead of porting the web version's
animated CSS-grid collapse. In rail (`collapsed`) mode every section header
is hidden and every body is always shown.

Dropped relative to `@gnome-ui/react`'s `Sidebar`/`SidebarItem`: `searchable`
(would pull in a `SearchBar`, not yet ported to this package — use `filter`
with your own input instead), `mode`/auto page-layout switch (depends on the
web-only `useBreakpoint` hook), `variant` (tinted/blurred backgrounds — the
blurred variant needs a native blur view this package doesn't depend on),
`tooltip` (no `Tooltip` port yet, and nothing to trigger one from on a
touch-first device), `menuItems` (context menu — no portal/positioning
primitive exists in this package yet), and `onDrop`/`acceptTypes` (HTML5
drag-and-drop has no RN equivalent without a gesture-handler dependency this
package doesn't have).

### SearchBar

```tsx
import { SearchBar } from '@gnome-ui/react-native';

<SearchBar
  open
  value={query}
  onChangeText={setQuery}
  onClear={() => setQuery('')}
  onClose={() => setOpen(false)}
/>;

// Filter chips below the bar:
<SearchBar open value={query} onChangeText={setQuery}>
  <Chip label="Apps" />
  <Chip label="Documents" />
</SearchBar>;
```

Collapsible search input. `open={false}` renders nothing at all rather than
porting the web version's CSS height/opacity transition — no established
animated-height pattern exists yet in this package (the same trade-off
`SidebarSection` made for its collapsible body) — and mounting on
`open={true}` auto-focuses the input, standing in for the web version's
`requestAnimationFrame`-on-open focus effect.

`onClose` renders a trailing "Cancel" button rather than being wired to an
Escape keypress: touch keyboards have no reliable Escape key, so a visible
button is the RN-idiomatic stand-in. The clear (×) button appears whenever
`value` is non-empty, mirroring the web version, and both icons are Unicode
glyphs (`🔍`/`×`) rather than `@gnome-ui/icons`, matching every other
no-SVG-dependency component in this package.

Dropped relative to `@gnome-ui/react`'s `SearchBar`: the `suggestions` /
`onSuggestionSelect` / `loadingSuggestions` / `renderSuggestion` /
`suggestionsLabel` autocomplete popover — it depends on a portal +
viewport-anchored positioning primitive (`createPortal` +
`getBoundingClientRect`) this package doesn't have yet, the same gap that
dropped `SidebarItem`'s `menuItems` context menu — and a `Spinner`
component, not yet ported.

### PathBar

```tsx
import { PathBar } from '@gnome-ui/react-native';

<PathBar
  segments={[
    { label: 'Home', path: '/home' },
    { label: 'Documents', path: '/home/documents' },
    { label: 'Projects', path: '/home/documents/projects' },
  ]}
  onNavigate={(path, index) => go(path)}
/>;
```

Breadcrumb location bar. Segments are separated by a `›` chevron; every
segment except the last is a pressable button that calls `onNavigate` with
its `path` and index, and the last segment renders as a static bold label —
the current location.

Rebuilt with `Pressable`/`View`/`Text` rather than ported from
`@gnome-ui/react`'s `<nav><ol><li>`: RN's `AccessibilityRole` union has
neither a "navigation" landmark nor a breadcrumb-list role (the same gap
that dropped `Sidebar`'s `<nav>` role), so those are dropped rather than
faked — each interactive segment still gets its own
`accessibilityRole="button"` and `accessibilityLabel`. The separator is a
Unicode `›` glyph instead of the web version's inline SVG chevron, matching
this package's established no-SVG-dependency convention.

### Spinner

```tsx
import { Spinner } from '@gnome-ui/react-native';

<Spinner />;
<Spinner size="lg" label="Syncing your library…" />;

// Rendered alongside your own label instead of announcing its own:
<Spinner label="" />;
```

Indeterminate loading ring — the first component from Tier 4 (Feedback).
`size` is `"sm"` | `"md"` | `"lg"` (16/24/36px). `label` defaults to
`"Loading…"`; pass `""` to silence it when a sibling label already
describes the loading state (mirrors the web version's same convention).

Rebuilt on `Animated.View` rather than ported from `@gnome-ui/react`'s
pure-CSS `@keyframes spin`: the ring itself reuses the same per-side-border
trick the CSS does (`borderColor` for the track, `borderTopColor` for the
accent-colored "head", on a fully-rounded circle) — RN's `View` supports
independent per-side border colors too, so that part translates directly.
The rotation is an `Animated.loop`d `Animated.timing` driving a `rotate`
transform with `useNativeDriver: true`. `useReducedMotion()` (see
`GnomeProvider` above) mirrors the source CSS's own
`@media (prefers-reduced-motion: reduce) { animation-duration: 2s }` —
slowed to 2s, not stopped outright, matching the web behavior exactly
rather than dropping the animation entirely.

RN's `AccessibilityRole` union has no "status" value (the web version's
`role="status"`); `"progressbar"` is the closest match for an
indeterminate loading indicator, with no `accessibilityValue` set — RN's
equivalent of omitting `aria-valuenow` for an indeterminate progress bar.

### ProgressBar

```tsx
import { ProgressBar } from '@gnome-ui/react-native';

<ProgressBar value={0.6} accessibilityLabel="Download progress" />;
<ProgressBar variant="success" value={1} />;

// Indeterminate — unknown duration:
<ProgressBar accessibilityLabel="Loading" />;
```

Determinate and indeterminate progress bar. `value` (0–1) shows exact
progress with an animated width transition on every change; omit it for
an indeterminate 40%-wide bar that slides left to right on a loop.
`variant` is `"accent"` (default) | `"success"` | `"warning"` | `"error"`.

`useReducedMotion()` (see `GnomeProvider` above) is honored per the
*source CSS's own* per-state behavior rather than one uniform rule:
determinate width changes simply skip the transition, while the
indeterminate pulse stops entirely and freezes as a static, full-width,
50%-opacity bar — exactly what the source
`@media (prefers-reduced-motion: reduce)` block does. This differs from
`Spinner`, whose reduced-motion behavior *slows* its animation instead of
stopping it outright — each component mirrors its own source CSS rather
than a single reduced-motion policy applied uniformly across the package.

`role="progressbar"` maps directly to RN's own `accessibilityRole` (no
substitution needed, unlike `Spinner`'s web `role="status"`).
`accessibilityValue` carries `min`/`max`/`now` for the determinate case;
the indeterminate case omits all three — RN's equivalent of the web
version omitting `aria-valuenow`/`aria-valuemin`/`aria-valuemax`. The web
version's `aria-labelledby` (an id-relationship prop) has no RN
equivalent — RN has no DOM ids — so only `aria-label`
(`accessibilityLabel`) is ported.

### Skeleton

```tsx
import { Skeleton } from '@gnome-ui/react-native';

<Skeleton />;
<Skeleton width={220} height={16} />;
<Skeleton variant="circle" size={48} />;
<Skeleton variant="text" lines={3} />;
<Skeleton animated={false} />;
```

Content-shaped loading placeholder — a pragmatic web-style extension for
layouts that benefit from placeholder shape (GNOME HIG itself recommends
`Spinner`/`ProgressBar` for loading states, but this is ported as-is from
`@gnome-ui/react` for parity). `variant` is `"rect"` (default, `width`/
`height`) | `"circle"` (`size` diameter) | `"text"` (`lines` rows, the
last one narrower).

The web version's shimmer is a `linear-gradient` swept across the shape
via `transform: translateX()`; this package has no gradient dependency
(no `expo-linear-gradient`/`react-native-linear-gradient` in its
dependency tree, and adding one for a single component would be scope
creep), so `animated` drives a plain opacity pulse instead — the same
1.4s round-trip cycle length as the web shimmer. This is a common
RN-idiomatic substitute for a CSS shimmer effect (compare Tailwind's own
`animate-pulse` utility, which uses the identical technique).

Unlike `Spinner` (slows) and `ProgressBar` (stops one state, slows the
other), `useReducedMotion()` here fully disables the pulse and shows a
static base color — mirroring the source CSS's own `animation: none`,
which has no partial-motion in-between state to preserve. Each Tier 4
component's reduced-motion behavior follows its own source CSS rather
than one policy applied uniformly across the package.

`accessible={false}` mirrors the web version's `aria-hidden="true"` — a
loading placeholder carries no information a screen reader user needs,
the same reasoning `Separator` already established for a purely
decorative element.

### Toast / Toaster

```tsx
import { Toast, Toaster } from '@gnome-ui/react-native';

function App() {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  return (
    <View style={{ flex: 1 }}>
      <YourAppContent />

      <Toaster>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            title={t.message}
            dismissible
            onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </Toaster>
    </View>
  );
}
```

Non-blocking temporary notification. `Toast` auto-dismisses after
`duration` ms (default 3000, `0` disables it) and stays fully prop-driven
— you own the list of active toasts and remove one from it in `onDismiss`,
exactly like the web version. `Toaster` stacks them, positioned
`"bottom"` (default) or `"top"`.

RN has no `document.body`/portal target to render into the way the web
version's `createPortal` does, so there's no `container` prop — mount
`Toaster` yourself as the **last** child of your app's root-level `View`
so it paints on top of everything else (see the example above).
`pointerEvents="box-none"` on `Toaster` is the RN equivalent of the web
version's `pointer-events: none` on the container: empty space around the
stack doesn't intercept touches, but each `Toast` (a `Pressable`) still
handles its own.

The timer-pause behavior is ported verbatim (`setTimeout`/`Date.now()`
bookkeeping, no DOM API involved) — only the *trigger* changes: RN has no
hover, so `onPressIn`/`onPressOut` (touch-down/touch-up) stand in for the
web version's `onMouseEnter`/`onMouseLeave`, pausing the auto-dismiss
timer while the user is actively touching the toast. There's no
`onFocus`/`onBlur`-triggered pause either — the card itself isn't
focusable in RN's touch-first model, only its action/dismiss buttons are,
and RN has no "focus-within" primitive to detect that.

The entrance is an `Animated.timing` fading + sliding + scaling in,
matching the web version's `@keyframes toast-in`; `useReducedMotion()`
skips straight to the settled state. RN's `AccessibilityRole` union has no
"status" value (the web version's `role="status"`); `"alert"` is the
closest available role, paired with `accessibilityLiveRegion="polite"`
(Android's live-region API) as the nearest match to `aria-live="polite"`.

### Banner

```tsx
import { Banner } from '@gnome-ui/react-native';

<Banner variant="info">A new version is available.</Banner>;
<Banner variant="error" actionLabel="Retry" onAction={() => {}}>
  Sync failed
</Banner>;
<Banner variant="success" dismissible onDismiss={() => {}}>
  Changes saved successfully.
</Banner>;
```

Persistent message strip for the top of a view. `variant` is `"info"`
(default) | `"warning"` | `"error"` | `"success"`, each mapping to the
matching `theme.<variant>BgColor`/`<variant>FgColor` token pair. Unlike
`Toast`, it never auto-dismisses — it stays until the user acts or presses
the optional dismiss button, so there's no `duration` prop at all.

Same accessibility substitution as `Toast`: RN's `AccessibilityRole` union
has no "status" value (the web version's `role="status"`), so `"alert"` +
`accessibilityLiveRegion="polite"` stands in for it. The banner itself is a
plain `View`, not `Pressable` (only its action/dismiss buttons are
interactive), so — per the `BoxedList` lesson that a bare `View` isn't an
accessibility element by default — `accessible` is set explicitly alongside
`accessibilityRole`.

The web version's per-variant `:hover`/`:active` background tint on the
action/dismiss buttons (a light overlay on the darker info/error/success
backgrounds, a dark one on the light warning background) collapses to a
single `Pressable`-pressed-state overlay, the same simplification `Toast`
and `Card` already made for their own press states.

### Dialog

```tsx
import { Dialog } from '@gnome-ui/react-native';

// Standard
<Dialog open={open} title="About Sync" onClose={() => setOpen(false)}>
  Files are synced automatically every 15 minutes.
</Dialog>;

// With buttons
<Dialog
  open={open}
  title="Discard changes?"
  onClose={() => setOpen(false)}
  buttons={[
    { label: 'Keep editing', onPress: () => setOpen(false) },
    { label: 'Discard', variant: 'destructive', onPress: () => setOpen(false) },
  ]}
>
  Your changes have not been saved.
</Dialog>;

// Alert — role="alertdialog" + responses/onResponse
<Dialog
  open={open}
  role="alertdialog"
  title="Delete file?"
  responses={[
    { id: 'cancel', label: 'Cancel' },
    { id: 'delete', label: 'Delete', variant: 'destructive' },
  ]}
  onResponse={(id) => setOpen(false)}
>
  This action cannot be undone.
</Dialog>;
```

Blocking modal dialog. **Standard** takes `title` + `children` + `buttons[]`
with per-button `onPress`; **Alert** (`role="alertdialog"`) takes
`responses[]` + a single `onResponse(id)` instead — the same two-API shape
as `@gnome-ui/react`'s `Dialog`, since `AlertDialog` there is a mode of the
same component rather than a separate one. `AboutDialog` (a distinct
`@gnome-ui/react` component, not a `Dialog` variant) has no RN port yet.

Built on RN's own `Modal` (`transparent`, `animationType="none"` — the
entrance is a custom `Animated.timing`) rather than the web version's DOM
`Portal` + manual focus trap: `Modal` already floats above everything with
no portal target needed, and already blocks interaction with the screen
behind it, so there's no `useBodyScrollLock` port. Its `onRequestClose`
fires on the **Android hardware back button** — the direct analog of the
web version's document-level Escape listener (iOS has no back button, so
this is Android-only, matching the platform's own convention). Focus
trapping (`Tab`/`Shift+Tab` cycling between focusable elements) has no
port at all — there's no keyboard `Tab` concept in RN's touch-first model,
the same reasoning that already dropped `TabBar`'s roving-tabindex arrow
keys.

`role` is set via RN's newer, web-aligned `role` prop (not
`accessibilityRole`) — its `Role` union has real `"dialog"`/`"alertdialog"`
values, unlike the older `AccessibilityRole` enum `Toast`/`Banner` had to
substitute `"alert"` into for the web's `role="status"`.
`accessibilityViewIsModal` (iOS-only) is the closest match to
`aria-modal="true"`, restricting VoiceOver to the dialog's subtree. The
dialog card sets `accessible` explicitly (a bare `View` with `role` isn't
an accessibility element by default — the same `BoxedList` lesson) —
**this shares the same open, unverified-on-a-real-device accessibility
question already flagged for `BoxedList`/`TabBar`/`ViewSwitcher`'s
container-role pattern**: `accessible={true}` on a container may collapse
its subtree into one opaque VoiceOver stop, which for `Dialog` specifically
would mean its footer buttons become unreachable via VoiceOver even though
they're independently `Pressable`. Kept for `getByRole` testability and
consistency with the established pattern, but this is the component where
that tradeoff matters most — worth prioritizing for real-device screen
reader verification before it's treated as settled.

### Tooltip

```tsx
import { Button, Tooltip } from '@gnome-ui/react-native';

<Tooltip label="Save file" placement="top">
  <Button accessibilityLabel="Save">Save</Button>
</Tooltip>;
```

Floating informational label. Positioned automatically and flips to the
opposite side (then to whichever side actually fits) when the preferred
placement has no room — the same algorithm as `@gnome-ui/react`'s
`Tooltip`, measured with `measureInWindow()` instead of
`getBoundingClientRect()`.

**Trigger differs from the web version by necessity**: the web `Tooltip`
only shows on mouse hover / keyboard focus — touch has no hover state, so
it explicitly never shows on touch. RN is touch-first, so the primary
trigger here is **long-press** (`delayLongPress={delay}`, released via
`onPressOut`) — the standard mobile "peek" idiom. `onHoverIn`/`onHoverOut`
are also wired for hover-capable input (trackpad/mouse on iPad, or a
pointer-driven RN target) and `onFocus`/`onBlur` for external-keyboard
accessibility, both delayed the same way the web version delays hover.

Built on RN's own `Modal` (transparent, `pointerEvents="box-none"`), the
same portal-substitute `Dialog` uses. `role="tooltip"` ports 1:1 — RN's
`Role` union already has a `"tooltip"` value. `aria-describedby` has no RN
equivalent, so the label is set as the trigger's `accessibilityHint`
instead (unless the trigger already provides its own). The bubble's arrow
reuses the same zero-size / transparent-border-on-three-sides triangle
trick as the web CSS — RN `View`s support per-side `border*Color` too, the
same technique `Spinner`'s ring already relies on.

Not ported: repositioning on scroll/resize while visible (RN has no global
scroll event, and a long-press is naturally cancelled by a scroll gesture
starting). `tooltipBgColor`/`tooltipFgColor` aren't real `@gnome-ui/core`
tokens (only CSS var fallbacks), so the RN port hardcodes the same literal
light/dark values, the same workaround `Spinner`'s track color established.

### Icon

```tsx
import { Search } from '@gnome-ui/icons';
import { Icon } from '@gnome-ui/react-native';

<Icon icon={Search} label="Search" size="lg" color="blue" />;
```

Renders an icon as an inline SVG via `react-native-svg` (a new peer
dependency — this package's first). Accepts the same `AnyIconDefinition`
union as `@gnome-ui/react`'s `Icon`: a structured `paths`-based
`IconDefinition` from `@gnome-ui/icons`, a `simple-icons` `SimpleIcon`, or a
plain `{ path }` object. `color` picks a named GNOME palette hue
(`theme.blue3`, `theme.red3`, …) — RN has no `currentColor` to inherit from
a parent the way the web version does, so omitting `color` resolves to the
theme's default foreground color explicitly instead.

`animated` icons (`Syncing`, `Recording`, `Downloading`, `Connecting`) carry
raw `svg` markup instead of `paths` — rendered here through `react-native-
svg`'s `SvgXml`. It parses the structural elements (`<g>`/`<path>`/
`<circle>`) but has no CSS engine, so the markup's embedded `<style>`/
`@keyframes` block is silently dropped and the shapes render at their
authored rest position — which happens to be exactly the desired inert,
static-frame behavior for a plain `<Icon>`, no special-casing needed. Wrap
in `<AnimatedIcon>` to actually play the motion.

### AnimatedIcon

```tsx
import { Syncing } from '@gnome-ui/icons';
import { AnimatedIcon } from '@gnome-ui/react-native';

<AnimatedIcon icon={Syncing} playing={isSyncing} label="Syncing" />;
```

Plays the motion for a known `animated` icon (`Syncing`, `Recording`,
`Downloading`, `Connecting`) — rendered through plain `<Icon>`, these show a
static frame instead, same as `@gnome-ui/react`'s `AnimatedIcon`.

Unlike the web version (which plays a CSS animation embedded in the icon's
raw `svg` markup via a `--gnome-icon-play-state` custom property), RN has
no CSS engine to interpret `@keyframes` at all. Each of the 4 known icons'
motion is instead hand-built with `Animated`, matched by referential
identity against `@gnome-ui/icons`' own exports (`Syncing` → full-turn
rotation, `Recording` → opacity pulse, `Downloading` → a translate+opacity
"drop" on the arrow over a static tray, `Connecting` → three signal dots
pulsing in a staggered sweep) — an icon `AnimatedIcon` doesn't recognize
(a future 5th animated icon, or a consumer-authored one) falls back to the
static `<Icon>` frame rather than throwing. Regardless of `playing`, the
animation is always paused when the OS reduced-motion setting is on.

### Dropdown

```tsx
import { Dropdown } from '@gnome-ui/react-native';

<Dropdown
  options={[
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green', description: 'A calm accent' },
  ]}
  value={accentColor}
  onChange={setAccentColor}
  placeholder="Accent color"
/>;
```

Expandable option list following the Adwaita combo-row pattern, mirroring
`@gnome-ui/react`'s `Dropdown`.

Built on RN's own `Modal` (transparent) — the same portal-substitute
`Dialog`/`Tooltip` already use — with a full-screen backdrop `Pressable`
that closes the list on an outside tap (the RN analog of the web version's
document-level "click outside" listener; unlike `Tooltip`'s backdrop, this
one isn't `pointerEvents="box-none"`, since it's meant to catch that tap
rather than pass it through). `open` flips synchronously on trigger press;
the trigger's on-screen rect and the panel's own rendered height each
resolve independently into state, combined by a separate effect into the
final position and flip-up/flip-down direction — the same two-independent-
async-measurements pattern `Tooltip` established.

Keyboard navigation (↑/↓ roving highlight, Home/End, type-ahead) has no
port — RN's touch-first model has no keyboard focus to drive it, the same
reasoning that already dropped `TabBar`'s roving-tabindex arrow keys.
Selection is by direct tap only. `role="combobox"` on the trigger ports
1:1; RN's `Role` union has no `"listbox"` value, so the panel uses
`role="list"` instead — the same closest-available substitution `BoxedList`
already established for a plain list container.

### Slider

```tsx
import { Slider } from '@gnome-ui/react-native';

<Slider
  value={volume}
  onChange={setVolume}
  accessibilityLabel="Volume"
  marks={[
    { value: 0, label: 'Min' },
    { value: 100, label: 'Max' },
  ]}
/>;
```

Draggable range control following the Adwaita `GtkScale` pattern, mirroring
`@gnome-ui/react`'s `Slider`.

Touch drag is handled with RN's own `PanResponder` (this package's first use
of it) reading each touch event's `locationX` — the position relative to the
track view itself, recalculated by RN on every touch/move — so no
`measureInWindow` round-trip is needed at all, unlike `Tooltip`/`Dropdown`'s
trigger-rect measurement. `min`/`max`/`step` clamping and snapping is ported
verbatim from the web version's pure-JS math.

The web version's keyboard interaction (← / → one step, Page Up/Down ten
steps, Home/End to the bounds) has no RN equivalent — a touch-first device
has no keyboard driving those keys. Rather than dropping value-adjustment
accessibility entirely (the reasoning that dropped `Dropdown`'s/`TabBar`'s
keyboard nav), `accessibilityRole="adjustable"` +
`onAccessibilityAction`/`accessibilityActions` wires up the "increment"/
"decrement" actions VoiceOver's swipe-up/down and TalkBack's local-context
menu generate for an adjustable element — the real native analog of
keyboard stepping, one step per action. The bigger Page Up/Down and
Home/End jumps have no equivalent screen-reader gesture on either platform,
so only single-step adjustment is ported.

RN's `transform` only accepts pixel offsets, unlike the CSS `%` units the
web version's `left: X%; transform: translate(-50%, -50%)` thumb/tick
centering trick needs — so those are positioned with a plain pixel `left`
computed from the track's `onLayout`-measured width instead. Mark labels
use a different trick, since (unlike the thumb/ticks) their own rendered
width isn't a known constant: a zero-width `View` with
`alignItems: 'center'` at the mark's percentage `left` lets Yoga center the
`Text` child around that point regardless of how wide the label renders,
with no measurement needed.

## Installation

```bash
npm install @gnome-ui/react-native react-native react-native-svg
```

`react-native-svg` is a peer dependency, only needed for `Icon`/
`AnimatedIcon` — it ships as one of Expo Go's included native modules, so
Expo projects on `npx expo install react-native-svg` need no extra native
build step; bare RN projects need it linked as usual for a native module.

## Example app

[`apps/react-native-example`](../../apps/react-native-example) is a
Storybook-style gallery for every component in this package, runnable in
[Expo Go](https://expo.dev/go) — no native build needed. From the repo
root: `npm start --workspace=@gnome-ui/react-native-example`.

## Testing

This package uses **Jest**, not the Vitest used elsewhere in the monorepo.
`react-native`'s published entry ships untranspiled Flow syntax
(`import typeof * as X from './index.js.flow'`) that only Jest's official
`@react-native/jest-preset` + `@react-native/babel-preset` know how to
strip before the module loads — Vitest has no hook that reaches a plain
`require("react-native")` call inside an already-external dependency (confirmed
against both `resolve.alias` and a custom `resolveId` plugin), so component
tests run under `jest.config.cjs` / `babel.config.cjs` instead. Pure-logic
tests (`resolveTheme`, `resolveContext`) run under the same Jest setup for
consistency rather than splitting the package across two runners.

Rendering uses `@testing-library/react-native` on top of `test-renderer`
(the actively maintained successor to the deprecated `react-test-renderer`).

## License

[MIT](../../LICENSE) © el_jijuna

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
> own public component) and `StatusPage` shipped — Tier 4 complete. Tier 5
> Advanced Controls fully ported: `Dropdown`, `Slider`, `SpinButton`,
> `Avatar`, `Badge`, and `Popover`. Beyond Tier 5, `BottomSheet` (Tier 14)
> and `Overlay`/`LevelBar`/`Expander`/`Divider`/`Highlight`/`FileTypeIcon`/
> `SegmentedBar`/`AvatarGroup`/`AvatarRotator`/`CoachMark`/`CoachMarkTour`
> (Tier 20), `Chip` (Tier 7), `IconButton`/`Drawer` (Tier 8/Tier 20), and
> `Clamp` (Tier 6), `Box` (Tier 20), `WrapBox`/`ToggleGroup` (Tier 7), and
> `InlineViewSwitcher` (Tier 8), `PreferencesGroup` (Tier 13), and
> `EntryRow`/`PasswordEntryRow` (Tier 12) also shipped. Component ports from
> `@gnome-ui/react` continue tier by tier — see this package's own
> [ROADMAP.md](./ROADMAP.md) for full
> per-tier status against all 130 `@gnome-ui/react` components, and the
> main [ROADMAP.md](../../ROADMAP.md) Priority 3 for the framework
> expansion this package belongs to.

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

### SpinButton

```tsx
import { SpinButton } from '@gnome-ui/react-native';

<SpinButton value={quantity} onChange={setQuantity} min={0} max={10} accessibilityLabel="Quantity" />;
```

Numeric −/+ stepper following the Adwaita `GtkSpinButton` pattern, mirroring
`@gnome-ui/react`'s `SpinButton`. The `min`/`max`/`step`/`decimals`/`wrap`/
`format` clamp-and-format math ports verbatim (pure JS, no DOM involved).

The primary interaction is tapping the visible −/+ buttons, same as a
sighted mouse user on the web version. The web version's keyboard
interaction (↑/↓ one step, Page Up/Down ten steps, Home/End to bounds) has
no RN equivalent — a touch-first device has no keyboard to drive it, the
same reasoning `Slider` already applied. Rather than dropping value
adjustment accessibility entirely, single-step increment/decrement reuses
`Slider`'s exact `accessibilityRole="adjustable"` +
`onAccessibilityAction`/`accessibilityActions` recipe (VoiceOver's
swipe-up/down, TalkBack's local-context menu) — the bigger Page Up/Down and
Home/End jumps have no equivalent screen-reader gesture on either platform,
so those alone are dropped, same as `Slider`. The visible −/+ buttons and
value text are hidden from the accessibility tree
(`accessibilityElementsHidden`/`importantForAccessibility="no"`, mirroring
the web version's `aria-hidden`/`tabIndex={-1}` on both `<button>`s and the
value `<span>`) so a screen reader user gets one adjustable stop, not three.

### Avatar

```tsx
import { Avatar } from '@gnome-ui/react-native';

<Avatar name="Grace Hopper" size="lg" />
<Avatar src="https://example.com/alice.jpg" alt="Alice's profile photo" />;
```

Circular avatar with image or initials fallback, mirroring `@gnome-ui/react`'s
`Avatar`. The color-hash and initials-extraction math ports verbatim (pure
JS, no DOM involved).

The outer container carries `role="img"` + `accessibilityLabel` — RN's newer
web-aligned `Role` union has an `"img"` value, a direct 1:1 port of the web
version's `role="img"`, no substitution needed (same as `ProgressBar`'s
`role="progressbar"`). The image/initials underneath are hidden from the
accessibility tree, mirroring the web version's `aria-hidden` on both, so a
screen reader gets one stop, not two — same reasoning as `SpinButton`'s
hidden −/+ buttons.

The web CSS's `box-shadow: inset 0 0 0 1px …` ring becomes a real 1px
`borderWidth`/`borderColor` here (RN has no inset shadow) — the same
substitution `Slider`'s thumb border already used for a ring effect.

### Badge

```tsx
import { Avatar, Badge } from '@gnome-ui/react-native';

<Badge variant="error" anchor={<Avatar name="Alice Bob" />}>3</Badge>
<Badge dot variant="success" />;
```

Counter or status indicator, optionally overlaid on another element,
mirroring `@gnome-ui/react`'s `Badge`. `children` renders as a themed `Text`
label when it's a string or number (the common case — counts and short
text); any other node renders as-is, the same convention `Button`'s
`children` already established.

The web CSS's `box-shadow: 0 0 0 2px var(--gnome-window-bg-color)` ring
(always present, separating the badge from whatever's behind it) has no RN
equivalent that avoids affecting layout — RN's `border*` shrinks the content
box instead of drawing outside it. Reproduced instead with an outer wrapping
`View` (2px padding, `theme.windowBgColor` background, pill radius) around
the actual colored badge, so the ring appears to spread outward exactly like
the web version's non-blurred shadow, without eating into the badge's own
text padding.

### Popover

```tsx
import { Button, Popover, Text } from '@gnome-ui/react-native';

<Popover content={<Text>Rich content here</Text>}>
  <Button>Open</Button>
</Popover>;
```

Floating panel anchored to a trigger element, following the Adwaita
`GtkPopover` pattern, mirroring `@gnome-ui/react`'s `Popover`. Unlike
`Tooltip`, it can hold rich interactive content (buttons, links, forms).

Reuses this package's own established pieces rather than re-deriving them:
`Tooltip`'s `cloneElement`-onto-an-arbitrary-trigger architecture and
4-placement fallback-cascade positioning (no arrow-offset-shift-when-clamped
— same simplification `Tooltip` already accepted), and `Dropdown`'s
toggle-on-press + full-screen backdrop `Pressable` that closes on an outside
tap plus reduced-motion fade-in.

**Deliberate divergence from `Dropdown`'s backdrop structure**: `Dropdown`
nests its panel directly inside the backdrop `Pressable` and gets away with
it because almost every pixel of its panel is itself a `Pressable` option
row, which claims the touch responder before it can bubble to the backdrop.
A popover's `content` is arbitrary — likely to have inert padding/whitespace
with no `Pressable` of its own — so nesting the same way would let a tap on
inert panel space fall through to the backdrop and close the popover, unlike
the web version's `.contains()` check (which never closes on *any* tap
inside the panel). Fixed with `onStartShouldSetResponder={() => true}` on
the panel itself: it claims the touch responder for any touch RN's
negotiation hasn't already given to a deeper `Pressable` inside `content`,
without making the panel itself behave like a button.

`BackHandler`'s `hardwareBackPress` (wired the same way `Dialog` already
does) is the Android analog of the web version's document-level Escape
listener. Focus-trapping and focus-restore-on-close have no port — no DOM
`document.activeElement`/`querySelector` equivalent exists in RN, the same
gap already present in `Dialog`/`Tooltip`/`Dropdown`.

The web version's rotated-square-with-matching-background arrow is replaced
with `Tooltip`'s simpler transparent-border-triangle technique — the same
visual affordance, a much simpler RN-native primitive.

### BottomSheet

```tsx
import { BottomSheet, Button } from '@gnome-ui/react-native';

<Button onPress={() => setOpen(true)}>Open</Button>
<BottomSheet open={open} title="Options" onClose={() => setOpen(false)}>
  <Text>Rich content here</Text>
</BottomSheet>;
```

Slide-up panel that overlays content from the bottom edge, mirroring
`AdwBottomSheet` (libadwaita 1.6+) and `@gnome-ui/react`'s `BottomSheet`.
Reuses `Dialog`'s backdrop-opacity-on-an-`AnimatedPressable` +
no-op-`Pressable`-around-the-card recipe, and `BackHandler`'s
`hardwareBackPress` as the Android analog of the web version's Escape
listener.

**Real drag-to-dismiss**, not a fixed-panel simplification: `PanResponder`
(the same core API `Slider` already proved handles a threshold gesture)
drives a single `Animated.Value` shared with the entrance/exit animation —
dragging the handle bar past 150 px (same constant as the web version)
requests a close; releasing short of that springs back to `0`. A real
slide-up needs the sheet's own height first (RN's `transform` has no
percentage-of-self units, the same `Slider`/`Avatar` pitfall) — the sheet
renders once off-screen, measured via `onLayout`, before animating in.

**A real, timed exit animation, unlike `Dialog`**: `Dialog`'s web source has
no exit keyframes at all, but `BottomSheet`'s does — ported with a local
`visible` state that lags one animation behind the `open` prop, flipping to
`false` only in the exit `Animated.timing`'s own completion callback.

The web version's `backdrop-filter: blur(4px)` has no port (no native blur
view dependency, same reasoning that dropped `Sidebar`'s blurred variant),
and `useBodyScrollLock` needs no RN equivalent (`Modal` already blocks all
background interaction). `children`, when a plain string, is wrapped in
`Text` before rendering — RN throws if a raw string is a `View`'s child,
unlike the web version's plain `<div>{children}</div>`.

### Overlay

```tsx
import { Overlay, Button } from '@gnome-ui/react-native';

<Button onPress={() => setOpen(true)}>Open</Button>
<Overlay open={open} onDismiss={() => setOpen(false)}>
  <YourOwnCard />
</Overlay>;
```

Standalone backdrop/scrim layer with a fade transition and
press-to-dismiss — the shared building block behind `Dialog`, `Dropdown`,
`Popover`, and `BottomSheet`'s own backdrops, extracted here for building
custom overlay UI, mirroring `@gnome-ui/react`'s `Overlay`.

Deliberately minimal, same as the web version: no focus trap, no
`BackHandler`/Escape handling, no `role` — use `Dialog`/`Popover`/
`BottomSheet` directly when you need those. Reuses `Dialog`'s exact
backdrop recipe (`AnimatedPressable` + a no-op `Pressable` wrapping
`children`, so a tap on your own content never bubbles to the backdrop and
dismisses it) and `BottomSheet`'s real, timed exit animation technique — a
local `visible` state that lags the `open` prop by one `Animated.timing`,
flipping to `false` only in that animation's own completion callback.

**Not retrofitted into `Dialog`/`Dropdown`/`Popover`/`BottomSheet`** — each
already ships and is fully tested with its own inline copy of this same
backdrop pattern (with small per-component differences: `Popover` claims
the touch responder differently than the no-op-`Pressable` wrapper the
others use). Extracting `Overlay` as a new standalone primitive was the
scoped ask; retrofitting four already-shipped components to share it is a
separate, riskier refactor this turn didn't take on.

### LevelBar

```tsx
import { LevelBar } from '@gnome-ui/react-native';

<LevelBar value={0.15} low={0.25} high={0.75} accessibilityLabel="Battery" />
<LevelBar value={0.6} discrete numBlocks={5} accessibilityLabel="Signal strength" />;
```

Discrete level indicator with color-coded low/high offset zones, mirroring
`GtkLevelBar` and `@gnome-ui/react`'s `LevelBar`. Use for a gauge/
measurement display (disk usage, battery, signal strength) — not for task
progress (`ProgressBar`) or a proportional category breakdown
(`SegmentedBar`).

The continuous fill reuses `ProgressBar`'s exact animation technique rather
than animating `width` directly: a fixed `width: '100%'` fill with
`transformOrigin: 'left'` and an animated `transform: [{ scaleX }]`, so the
whole thing runs on `useNativeDriver: true` — a JS-driven `width` animation
schedules its next frame via a plain `setTimeout` that routinely fires
after a test's `render()` returns but before unmount, producing a spurious
"update not wrapped in act()" warning, the same reasoning `ProgressBar`'s
own docstring documents. `useReducedMotion()` mirrors `ProgressBar`'s
determinate behavior (duration drops to `0`, an immediate jump).

Discrete mode's per-block color transition has no port — a value change is
a plain, unanimated color swap per block, a decorative nicety rather than a
behavior gap. `role="meter"` ports 1:1 from RN's newer web-aligned `Role`
union (unlike `AccessibilityRole`, which has no `"meter"` value at all).

### Expander

```tsx
import { Expander } from '@gnome-ui/react-native';

<Expander label="Show advanced options">
  <TextField label="Custom endpoint" />
</Expander>
```

Standalone disclosure triangle + collapsible content, mirroring `GtkExpander`
and `@gnome-ui/react`'s `Expander`. A bare, unstyled counterpart to
`ExpanderRow`; use it outside a settings-row context (e.g. "Show advanced
options" in a form, or "Show details" under an error message).

The web version clips the panel with a CSS grid-height animation and rides
the content's `padding-top` on a second, separate transition, so a collapsed
expander doesn't reserve blank space for hidden padding. RN has no CSS grid
to lean on, so the panel is a single `Animated.View` whose numeric `height`
is driven directly (`useNativeDriver: false`, the same accepted trade-off
`Checkbox`/`RadioButton`/`Switch`/`AnimatedIcon` already make for
non-transform properties) — since the content's own `onLayout` measurement
already includes its `paddingTop`, one animated height reproduces the web
version's two-transition result. Content stays mounted while collapsed
(`accessibilityElementsHidden`/`importantForAccessibility="no"`, the same
substitution for the web's `inert` used elsewhere in this package), and on
first mount with `defaultExpanded` the panel briefly renders at its natural,
unmeasured height so the initial reveal doesn't pop once layout resolves.

The chevron is `PanEnd` (GNOME's own `pan-end-symbolic` disclosure triangle)
rotating 0deg → 90deg on an `Animated.Value`, the same `interpolate`-to-
`rotate` recipe `Spinner` uses for its own spin.

### Divider

```tsx
import { Divider } from '@gnome-ui/react-native';

<Divider>OR</Divider>
<Divider>Continue with</Divider>
<Divider />
```

Horizontal rule with an optional centered label — the common auth/login-form
pattern ("Sign in" / **OR** / "Continue with Google"). Mirrors
`@gnome-ui/react`'s `Divider`. For a bare dividing line with no label, use
`Separator` instead — it also supports a vertical orientation, which
`Divider` does not.

`role="separator"` ports 1:1 from RN's newer web-aligned `Role` union (the
same one `Avatar`/`Badge`/`LevelBar` already reach for) — unlike
`Separator`'s own `accessible={false}`, since a labelled `Divider` ("OR") is
exactly the kind of content a screen reader user needs read aloud, rather
than a purely decorative line. The label reuses `Text`'s
`variant="caption" color="dim"` verbatim, which already resolves to the same
font-size/weight/dim-opacity the web version's `.label` class hard-codes.

### Highlight

```tsx
import { Highlight } from '@gnome-ui/react-native';

<Highlight text="Preferences for accessibility" query="access" />
<Highlight text="The quick brown fox" query={['quick', 'fox']} />
```

Wraps every occurrence of `query` within `text` in a highlighted inline run
— mirrors `@gnome-ui/react`'s `Highlight`, which wraps matches in a `<mark>`.
Pairs with `SearchBar`'s suggestion list and any filterable list to show
users which part of a result matched what they typed.

The outer span is the themed `Text` component (so callers get the same
`variant`/`color` API as everywhere else), but each matched run is a plain,
unthemed RN `Text` carrying only the highlight's own overrides — RN's `Text`
is the one primitive that inherits ambient `fontSize`/`color`/`fontFamily`
from a parent `Text` when nested, the same way the web version's `<mark>`
inherits from its surrounding text and only overrides
`background-color`/`font-weight`. Reaching for the themed `Text` for the
marked runs too would reset them to its own default `variant="body"` sizing
instead of inheriting whatever variant the caller chose for the whole
string.

The web version's translucent `color-mix(in srgb, accent 30%, transparent)`
background has no RN equivalent (`color-mix` is CSS-only) — resolved to a
literal 8-digit `#RRGGBBAA` hex instead, since `accentBgColor` is always a
plain 6-digit hex across all four theme variants. `border-radius` on the
`<mark>` has no reliable port either: RN only paints `backgroundColor` on an
inline (nested) `Text` run, not `borderRadius` — a decorative nicety
dropped, not a behavior gap. `prefers-contrast: more`'s solid-background/
white-text swap ports via `useResolvedContrast()`, the same hook `Button`
already uses for its own high-contrast branching.

### FileTypeIcon

```tsx
import { FileTypeIcon } from '@gnome-ui/react-native';

<FileTypeIcon name="report.pdf" />
<FileTypeIcon mimeType="image/png" />
<FileTypeIcon name="cover.jpg" thumbnail={thumbnailUrl} />
<FileTypeIcon isFolder />
```

Small icon — optionally a thumbnail — resolved from a file's MIME type or
name extension. Useful for file-manager-style listings. Mirrors
`@gnome-ui/react`'s `FileTypeIcon`, falling back to the generic file icon
(freedesktop's `text-x-generic`) when the type can't be resolved.

`fileType.ts`'s category-resolution logic (MIME type / extension → one of
13 categories, plus the freedesktop icon and generated label per category)
is pure, DOM-free TS — duplicated verbatim from `@gnome-ui/react` rather
than imported cross-package, the same `Icon.tsx` precedent already
established for logic that isn't worth a shared package for one file's
worth of code. `role="img"` + `accessibilityLabel` ports 1:1, and the
thumbnail reuses `Avatar`'s own `Image`/`resizeMode="cover"` recipe, sized
from `Icon`'s own size map so swapping between the resolved icon and a
thumbnail never shifts layout.

### Chip

```tsx
import { Chip } from '@gnome-ui/react-native';

<Chip label="React" />
<Chip label="React" onRemove={() => {}} />
<Chip label="React" selectable selected={selected} onToggle={() => setSelected((s) => !s)} />
```

Compact pill-shaped label for tags, filters, and selection states. Mirrors
`@gnome-ui/react`'s `Chip`. Three usage modes: **static** (just a visual
label), **removable** (add `onRemove` for a × button), and **selectable**
(add `selectable` + `selected` + `onToggle` for toggle behavior — same
`isInteractive = selectable && !onRemove` precedence as the web version,
so passing both renders the remove button, not a toggle). Pair with
`WrapBox` for multi-chip layouts.

The selected background/border tint
(`color-mix(in srgb, accent 15%/50%, transparent)`) resolves to a literal
8-digit `#RRGGBBAA` hex, the same `Highlight` precedent. The web version's
`:hover`/`:active` background transitions collapse into a single
pressed-state overlay tinted by `theme.activeOverlay` (the same
`ActionRow`/`Card` recipe), since touch has no hover. The leading icon and
remove (×) icon stay in the default foreground color rather than tracking
the selected accent text (`color: inherit` on the web) — RN's `Icon` has
no `currentColor` equivalent and only accepts a fixed named-swatch
palette, none of which tracks the app's configurable accent color, so
this is a decorative nicety dropped, not a behavior gap.
`accessibilityRole="checkbox"` on the selectable form ports 1:1, the same
`Checkbox` precedent.

### SegmentedBar

```tsx
import { SegmentedBar } from '@gnome-ui/react-native';

<SegmentedBar
  values={[
    { label: 'TypeScript', value: 60, color: '#3178c6' },
    { label: 'JavaScript', value: 30, color: '#f7df1e' },
    { label: 'CSS',        value: 10, color: '#563d7c' },
  ]}
/>
```

Horizontal bar split into proportional segments, one per category. Mirrors
`@gnome-ui/react`'s `SegmentedBar`. Typical use case: repository language
distribution. Values are normalized proportionally when they don't sum to
100.

The web version's hover interaction (dim every segment but the one under
the pointer, brighten that one via `filter: brightness()`) is rebuilt for
touch rather than dropped: each segment is a `Pressable`, and touching one
dims the rest immediately via `onPressIn`/`onPressOut` — deliberately not
gated behind `Tooltip`'s own long-press delay, since this feedback is the
RN analog of a `Pressable`'s own instant `pressed` state, not the "peek"
affordance a tooltip reveal is. Each segment is also wrapped in `Tooltip`
(`placement="top"`, `delay={200}`, ported 1:1) for the label/percentage
readout — `Tooltip` clones its own handlers onto the child while still
calling the child's original ones, so the dim/highlight and the tooltip
compose cleanly on the same `Pressable`. `filter: brightness(1.15)` on the
actively-touched segment has no RN equivalent — dropped as a decorative
nicety, since the touched segment already reads as highlighted by
contrast once every other segment dims to 35% opacity.

### IconButton

```tsx
import { IconButton } from '@gnome-ui/react-native';
import { Search } from '@gnome-ui/icons';

<IconButton icon={Search} label="Search" />
<IconButton icon={Search} label="Search" tooltip="Search files" />
```

Icon-only action button composed from `Button`, `Icon`, and optionally
`Tooltip` — mirrors `@gnome-ui/react`'s `IconButton`, itself already just a
thin composition of those same three pieces. `label` is required since the
button has no visible text. Built as a genuine prerequisite for `Drawer`'s
`rail`, not scope creep — every piece it composes already existed.

### Drawer

```tsx
import { Drawer } from '@gnome-ui/react-native';

<Drawer open={open} title="Details" onClose={() => setOpen(false)}>
  <Text>Drawer content can be any React node passed as children.</Text>
</Drawer>
```

Slide-in panel for supplementary content, anchored to the left or right
edge. Mirrors `@gnome-ui/react`'s `Drawer`. Supports a `rail` (an
`IconButton` strip on the drawer's inner edge for switching panels without
closing it) and nested-drawer width auto-scaling via context — a `Drawer`
opened from within another drawer's content automatically renders
narrower (`0.85^depth`, floored at 240px), so stacked drawers read as a
drill-in hierarchy.

Floats with a margin on every side and all four corners rounded, matching
`@gnome-ui/react`'s own recent CSS update to the same look — positioned
within the padded backdrop via `justifyContent` rather than the web CSS's
`margin: auto` on the drawer itself, since RN auto-margin support was
unverified for this Yoga version (confirmed correct with an on-device
debug-color check before trusting it; `BottomSheet` already proves the
same `justifyContent: 'flex-end'` mechanism on its own vertical axis).
Unlike `BottomSheet`, there's no drag-to-dismiss — the web source defines
no exit keyframes at all, so this follows `Dialog`'s simpler animation
shape instead. `backdrop-filter: blur(4px)` has no port (no native blur
dependency in this package).

### AvatarGroup

```tsx
import { AvatarGroup } from '@gnome-ui/react-native';

<AvatarGroup
  avatars={[{ name: 'Alice Martin' }, { name: 'Bob Smith' }, { name: 'Carol White' }]}
  max={5}
/>
```

Overlapping stack of `Avatar`s with a "+N" overflow indicator. Mirrors
`@gnome-ui/react`'s `AvatarGroup`. The web version's separating ring
around each overlapping avatar is two layered `box-shadow`s (an inset 1px
dark/light border plus an outset 2px window-colored ring) — RN can only
give a `View` one border, so this keeps just the outer window-colored
ring (overriding `Avatar`'s own subtle 1px ring via its `style` prop),
since that's the ring doing the actual "stay visually distinct from the
avatar behind you" work. The overflow chip reuses `Avatar`'s own per-size
box dimensions so it lines up exactly with the avatars beside it.
`role="group"` + an auto-generated `accessibilityLabel` (joined names,
plus "and N more" when overflowing) port 1:1 from RN's newer web-aligned
`Role` union.

### AvatarRotator

```tsx
import { AvatarRotator } from '@gnome-ui/react-native';

<AvatarRotator name="Alice Martin" avatars={[url1, url2, url3]} />
```

Single avatar surface that crossfades through multiple image sources.
Mirrors `@gnome-ui/react`'s `AvatarRotator`. Keeps `Avatar` focused on
rendering one identity, while this component owns timing, crossfade
animation, and pause behavior.

Each source renders as its own absolutely-positioned `Avatar`, crossfaded
with `Animated.timing` (`useNativeDriver: true`) — a `RotatorLayer`
sub-component owns each layer's own `Animated.Value` rather than the
parent tracking an array of them, the same "each item animates itself"
shape `Toast`/`Toaster` already established for independently
transitioning list items. `prefers-reduced-motion` stops the rotation
outright, not just the fade — ported exactly from the web version's own
auto-advance effect, which bails out early on both `isPaused` and reduced
motion alike. `pauseOnHover` becomes `pauseOnPress`
(`onPressIn`/`onPressOut`) — the same touch substitution `Toast`'s own
press-and-hold pause already established, kept as a real toggleable prop
here (defaults `true`).

### CoachMark / CoachMarkTour

```tsx
import { CoachMark, CoachMarkTour } from '@gnome-ui/react-native';

<CoachMark
  open={open}
  targetRef={target}
  title="Sync your files"
  description="Press this to keep every device up to date."
  primaryAction={{ label: 'Got it', onPress: () => setOpen(false) }}
  onDismiss={() => setOpen(false)}
/>

<CoachMarkTour
  open={running}
  steps={[
    { targetRef: searchRef, title: 'Search', description: 'Find anything fast.' },
    { targetRef: addRef, title: 'Add', description: 'Create a new item here.', placement: 'left' },
  ]}
  onFinish={() => setRunning(false)}
  onSkip={() => setRunning(false)}
/>
```

Spotlights a target element and anchors a callout bubble (title,
description, step counter, actions) beside it, guiding a user to one
feature. Compose several with `CoachMarkTour`, or drive one directly with
`open`. Mirrors `@gnome-ui/react`'s `CoachMark`/`CoachMarkTour` — not a
GNOME HIG widget, a pragmatic feature-discovery pattern.

Positions with the same two-pass viewport-aware flip as the web version
(`coachMarkUtils.ts`, duplicated verbatim — pure math, no DOM), resolved
from `targetRef.current?.measureInWindow(...)` and the bubble's own
`onLayout` size. **The measurement is deliberately delayed (a real
`setTimeout`, not just one `requestAnimationFrame`)** — confirmed
on-device that measuring too early catches a stale rect when the target
sits below sibling content whose own size isn't final on the first commit
(e.g. a multi-line description `Text` above it); a single rAF still
landed before the follow-up layout pass accounted for it.

The spotlight cutout has no CSS `box-shadow: 0 0 0 100vmax` port — that
trick paints an opaque scrim everywhere except inside a rounded rect via a
huge spread shadow, which RN's real OS shadows can't reproduce. Rebuilt as
four plain `View` bands around the padded target rect, plus a separate
rounded `accentColor`-bordered ring on top — the whole overlay sits inside
one full-screen `Pressable`, so a tap anywhere within it (including
visually "in the hole") triggers `dismissOnBackdrop`, matching the web
version exactly. `dismissOnBackdrop` has no effect when `spotlight` is
`false` — ported faithfully, not fixed: the web source only renders a
backdrop element at all when `spotlight` is true. The arrow reuses
`Popover`/`Tooltip`'s transparent-border-triangle trick rather than the
web CSS's rotated-45°-square, offset along the bubble's edge by
`arrowOffset` from the position math (unlike `Tooltip`/`Popover`'s simpler
always-centered arrow). No focus trap and no scroll/resize
re-positioning, the same established gaps for a transient RN floating
element. `CoachMarkTour` is pure state orchestration on top of
`CoachMark`, ported verbatim.

### Clamp

```tsx
import { Clamp } from '@gnome-ui/react-native';

<Clamp>
  <BoxedList>{/* … */}</BoxedList>
</Clamp>

<Clamp maximumSize={480} tighteningThreshold={0.9}>
  <Text>Never wider than 480 dp, and never edge-to-edge below it</Text>
</Clamp>
```

Constrains its children to a maximum width while letting them shrink freely
— mirrors `@gnome-ui/react`'s `Clamp` and the Adwaita `AdwClamp` widget. Use
it on settings pages and forms so content never becomes too wide to read
comfortably on a tablet or a landscape phone, while still filling the width
on a narrow one. `maximumSize` defaults to **600** (the Adwaita recommended
narrow-content width) and is in density-independent pixels, not CSS px.
Adds no padding of its own.

The web version's `margin-inline: auto` centering becomes
`alignSelf: 'center'` rather than `marginHorizontal: 'auto'` — RN
auto-margin support was left unverified for this Yoga version back when
`Drawer` needed the same trick, so this follows `Drawer`'s resolution of
using flex alignment instead. The one consequence is that `Clamp` expects a
column-direction parent (RN's default): `alignSelf` acts on the cross axis,
so inside a `flexDirection: 'row'` parent it would centre vertically. Wrap
it in a plain `View` there.

`tighteningThreshold` is a real percentage width here, unlike in
`@gnome-ui/react`, where the prop is declared and documented but never
reaches the DOM — implementing it exactly as that package documents it (a
fraction of the available width, still capped by `maximumSize`) costs
nothing on RN and avoids shipping a dead prop.

### Box

```tsx
import { Box } from '@gnome-ui/react-native';

// Vertical section (heading + content)
<Box spacing={12}>
  <Text variant="caption-heading" color="dim">Devices</Text>
  <BoxedList>{/* … */}</BoxedList>
</Box>

// Horizontal icon + label
<Box orientation="horizontal" spacing={6} align="center">
  <Icon icon={Folder} size="sm" />
  <Text>Documents</Text>
</Box>
```

Fundamental flex layout primitive — the RN equivalent of `GtkBox`, and a 1:1
mirror of `@gnome-ui/react`'s own `Box`. Arranges children in a row or
column with consistent spacing from the GNOME HIG scale: **3** (tight) ·
**6** (standard, the default) · **12** (medium) · **18** (large) · **24**
(section) · **32** (loose) · **48** (jumbo), all in dp. `align` defaults to
`"stretch"` when vertical and `"center"` when horizontal, `justify` to
`"start"`.

`BoxSpacing` keeps the web package's exact seven values rather than being
remapped onto this package's own `theme.space1`–`space6` scale — the two
overlap at 6/12/18/24/48 but not at 3 or 32/36, and `BoxSpacing` is a
published type consumers may already be importing, so it ports verbatim.

Two things the web version accepts don't survive the platform. `spacing`
and `padding` are numbers only — RN's `gap`/`padding` take dp, not CSS
strings like `"1rem"`. And `align`/`justify`, which the web hands straight
to CSS, are mapped internally from their bare `start`/`end` keywords onto
Yoga's `flex-start`/`flex-end`; the prop values stay the web ones, so the
API reads identically across both packages. `display: 'flex'` needs no port
at all — every RN `View` is already a flex container.

### WrapBox

```tsx
import { WrapBox } from '@gnome-ui/react-native';

// Tag list
<WrapBox>
  {tags.map((tag) => <Chip key={tag} label={tag} />)}
</WrapBox>

// Tight between items, loose between lines
<WrapBox childSpacing={6} lineSpacing={18} justify="center">
  {filters.map((filter) => <Chip key={filter} label={filter} />)}
</WrapBox>
```

Flexible wrapping layout container — children flow horizontally and wrap to
new lines when they don't fit, like words in a paragraph, without locking
them into a grid. Mirrors `AdwWrapBox` (libadwaita 1.7 / GNOME 48) and
`@gnome-ui/react`'s own `WrapBox`. Pair with `Chip` for tag lists and filter
rows.

`childSpacing` (default **6**) is the gap between items on a line;
`lineSpacing` is the gap between lines and falls back to `childSpacing` when
omitted — passing `0` really means zero, not "fall back". `justify` defaults
to `"start"` and `align` to `"center"`; `wrapReverse` stacks lines bottom to
top.

The web version ships its values as CSS custom properties consumed by a
stylesheet (`--wrapbox-gap`, `--wrapbox-justify`, …) because a CSS module
can't take runtime values any other way — RN has no such indirection, so
they're written straight onto the style object. `flex-flow: row wrap`
becomes `flexDirection: 'row'` + `flexWrap`, and the CSS shorthand
`gap: <row> <column>` splits into RN's separate `rowGap`/`columnGap`; the
single `gap` property would set both, which is precisely what this component
has to be able to avoid. As in `Box`, the spacing props are numbers only
(dp, not CSS strings) and `align`/`justify` keep the web's bare `start`/`end`
keywords while mapping internally onto Yoga's `flex-start`/`flex-end`.

`alignContent: 'stretch'` is set explicitly even though neither package
exposes an `alignContent` prop: **CSS defaults it to `stretch`, Yoga defaults
it to `flex-start`**, so without it `align="stretch"` silently does nothing
whenever the children have no cross-size of their own — the line collapses to
zero height before `alignItems` gets to stretch anything into it. Caught
on-device; it's a no-op in the ordinary case where the container hugs its
content rather than having a fixed height.

### StatusPage

```tsx
import { StatusPage } from '@gnome-ui/react-native';

<StatusPage
  icon={StarOutline}
  title="No favorites yet"
  description="Packages you star will show up here."
>
  <Button variant="suggested" onPress={onAdd}>Add a package</Button>
</StatusPage>

// For sidebars, popovers, and small panels
<StatusPage compact icon={Search} title="No results" />
```

Empty-state / status page following the Adwaita `AdwStatusPage` pattern —
mirrors `@gnome-ui/react`'s `StatusPage`. Use it to fill a view with no
content yet, an error state, or a completion confirmation. Always explain
*why* the view is empty and *what the user can do* about it; don't use it
for loading states, where `Spinner` or `ProgressBar` belong instead.
`compact` scales padding, icon size, title variant, description
variant/measure and both action-area gaps down together.

It centres its content on both axes, but — exactly as in the web version —
the vertical centring only does anything once a parent gives it height: put
it in a `flex: 1` container to fill the view.

The title renders through this package's `Text` at `variant="title-1"`
(`"title-4"` when `compact`), so it also picks up `Text`'s automatic
`header` accessibility role — a deliberate divergence from the web
version's `<p class="title">`. That `<p>` exists because HTML forces you to
pick a concrete `h1`–`h6` level for a component that can't know where it
sits in the document outline; RN's `header` role carries no level, so the
dilemma disappears. On a touch device the rotor is the only structural
navigation a screen reader user has, which makes the role worth having.

`max-width: 36ch` on the description has no RN unit to port to. `ch` is the
advance width of "0", ≈ 0.5em in the sans faces Adwaita uses, so the cap is
resolved against the description's own font size — 288 dp at body size, 216
dp at caption size — keeping the measure font-relative the way the CSS is,
rather than freezing one pixel value that `compact` would get wrong. The
icon is dimmed by its wrapper's opacity (0.55 light / 0.45 dark, the two
values the web's own `prefers-color-scheme` block hardcodes) and hidden
from assistive tech with the `accessibilityElementsHidden` +
`importantForAccessibility="no"` pair used in place of `aria-hidden`. The
action area is a `WrapBox` rather than a hand-rolled row — `.actions` is a
centred wrapping flex row with a gap and nothing else.

### ToggleGroup / ToggleGroupItem

```tsx
import { ToggleGroup, ToggleGroupItem } from '@gnome-ui/react-native';

const [align, setAlign] = useState('left');

<ToggleGroup value={align} onValueChange={setAlign} accessibilityLabel="Alignment">
  <ToggleGroupItem name="left" icon={FormatJustifyLeft} accessibilityLabel="Left" />
  <ToggleGroupItem name="center" icon={FormatJustifyCenter} accessibilityLabel="Center" />
  <ToggleGroupItem name="right" icon={FormatJustifyRight} accessibilityLabel="Right" />
</ToggleGroup>

// Items can be icon-only, label-only, or icon + label
<ToggleGroupItem name="grid" icon={Applications} label="Grid" />
```

Mutually-exclusive group of toggle buttons for in-place option selection —
mirrors `AdwToggleGroup` (libadwaita 1.7 / GNOME 48) and
`@gnome-ui/react`'s own `ToggleGroup`. Use it for formatting controls,
view-mode selectors and toolbar options, wherever a `ViewSwitcher` would be
too heavy or doesn't belong in a `HeaderBar`. For icon-only items always
pass an `accessibilityLabel`.

The context and its `value`/`onValueChange` shape port 1:1 — pure React. The
keyboard layer doesn't: the web version owns an `onKeyDown` implementing
← / → cycling and Home / End jumps over a roving `tabIndex`, none of which
has a touch counterpart, so it drops per this package's standing convention
(set by `ViewSwitcher` and `TabBar`). The `radiogroup`/`radio` + `checked`
pairing that VoiceOver and TalkBack actually announce carries the semantics
instead.

The group sets `accessibilityRole="radiogroup"` but deliberately **not**
`accessible` — on iOS, `accessible` on a container collapses the whole
subtree into a single accessibility element, which would make the individual
toggles unreachable for VoiceOver. Without it the role still groups on
Android while every item stays focusable on its own.

Three `color-mix(in srgb, accent N%, transparent)` values resolve to 8-digit
`#RRGGBBAA` hexes off `theme.accentBgColor` (the `Chip` precedent for the
same selected-tint problem), so the tint follows the app's configurable
accent color. The CSS paints its active ring as an `inset` box-shadow, which
RN has no equivalent for — it becomes a real `borderWidth: 1` that every
item carries at all times (transparent when inactive) so selecting one never
shifts the row's layout, the substitution `AvatarGroup` already made for its
own ring. `box-shadow: var(--gnome-shadow-sm)` on the group is dropped
rather than approximated: the theme generator keeps shadow tokens in `raw`
only, and `Card` already established that a border carries the same
separation here. `:hover` collapses away and `:active` maps to `Pressable`'s
`pressed` using `theme.activeOverlay`, whose light/dark values match the
CSS's own `:active` colors exactly.

The icon keeps the default foreground color instead of tracking the active
accent text — `Icon` has no `currentColor` equivalent and its `color` prop
is a fixed GNOME palette with no `accent` member, which couldn't follow a
configurable accent anyway. Same call, same reason, as `Chip`.

### InlineViewSwitcher / InlineViewSwitcherItem

```tsx
import { InlineViewSwitcher, InlineViewSwitcherItem } from '@gnome-ui/react-native';

const [view, setView] = useState('grid');

<InlineViewSwitcher value={view} onValueChange={setView} variant="pill">
  <InlineViewSwitcherItem name="grid" label="Grid" icon={Applications} />
  <InlineViewSwitcherItem name="list" label="List" icon={ViewSidebar} />
</InlineViewSwitcher>

// Collapse to a BottomSheet picker when the items stop fitting
<InlineViewSwitcher value={view} onValueChange={setView} overflow="menu">
  {/* … */}
</InlineViewSwitcher>
```

Compact inline view switcher for content areas, cards and toolbars —
wherever `ViewSwitcher` (header-bar sized) would be too heavy. Mirrors
`AdwInlineViewSwitcher` (libadwaita 1.7 / GNOME 48) and `@gnome-ui/react`'s
own `InlineViewSwitcher`. Four variants — `default` (card surface + border),
`flat` (indicator only), `round` (pill container, solid accent indicator),
`pill` (segmented-control look, no accent) — and four overflow strategies:
`wrap`, `scroll`, `compact`, `menu`.

Almost none of the *mechanism* ports, so this is a rebuild rather than a
transliteration:

- **The sliding indicator** is measured, not laid out. The web reads the
  active button's `offsetLeft`/`offsetWidth`; here each item reports its own
  `onLayout` up through the context and the indicator animates `translateX` +
  `width` on **one JS-driven animation** (`useNativeDriver: false`). `width`
  can't be native-driven and mixing a native with a JS value on one component
  throws — the trade-off `Expander` already accepted for its animated height.
  `scaleX` would have been native-driveable but distorts the corner radii the
  variants are defined by. `useReducedMotion()` snaps it into place instead.
- **Overflow detection** replaces `ResizeObserver` + `scrollWidth` vs
  `clientWidth` with the item measurements already being collected: their
  summed natural widths (RN leaves `flexShrink` at 0, so an overflowing row
  still reports each item at full width) against the row's own `onLayout`.
  The web's `naturalWidthRef` capture and 30 px hysteresis port verbatim —
  without them, collapsing the labels shrinks the content and immediately
  re-expands it.
- **`overflow="scroll"`** becomes a horizontal `ScrollView` with the
  scrollbar hidden; `scroll-snap-align: start` has no RN style, but the
  measured item offsets feed `snapToOffsets`, which reproduces it exactly.
- **`overflow="menu"`** reuses the already-shipped `BottomSheet`.

The ←/→/Home/End keyboard layer drops as everywhere else here, and — as in
`ToggleGroup` — the group takes `accessibilityRole="radiogroup"` but
deliberately not `accessible`, which on iOS would collapse the items into one
unreachable element.

One divergence is a fix, not a port: the web applies its `.active` class to
the menu trigger even though menu mode hides the indicator, which paints
`round`'s trigger label in `accent-fg` (#fff) on a plain card — white on
white. The RN trigger uses the idle color.

### PreferencesGroup

```tsx
import { PreferencesGroup } from '@gnome-ui/react-native';

<PreferencesGroup
  title="Appearance"
  description="How the app looks on this device."
  headerSuffix={<Button variant="flat" onPress={reset}>Reset</Button>}
>
  <BoxedList>{rows}</BoxedList>
</PreferencesGroup>
```

Titled section that wraps a `BoxedList` with an optional description —
mirrors `AdwPreferencesGroup` and `@gnome-ui/react`'s own
`PreferencesGroup`. Use it to group related settings under a named heading.
It's purely a layout and labelling wrapper: it doesn't render the
`BoxedList` itself, you pass one as `children`. All three header parts are
optional; with none of them the header row is omitted entirely.

The web's empty `.content` wrapper looks like dead markup but is
load-bearing, so it's kept. The group is a 12 dp-gap flex column — without
that wrapper every child would become a flex item of the group and pick up a
12 dp gap between the rows themselves, instead of one gap between the header
and the content as a whole.

The title renders as `Text variant="body"` with an explicit semibold weight
rather than `variant="heading"`, which is body-sized but **bold** and on the
tighter heading line-height; the CSS `.title` is specifically semibold at the
body line-height. It keeps the `header` accessibility role anyway (passed
explicitly), since a settings-group heading is exactly the kind of landmark a
screen reader rotor should list — the same call `StatusPage` makes for its
own title. `min-width: 0` on the header text has no port and needs none: it's
the classic CSS flexbox override for a min-content floor Yoga doesn't apply
in the first place.

### EntryRow

```tsx
import { EntryRow } from '@gnome-ui/react-native';

const [name, setName] = useState('');

<BoxedList>
  <EntryRow title="Display name" value={name} onValueChange={setName} />
  <EntryRow
    title="Email"
    value={email}
    onValueChange={setEmail}
    keyboardType="email-address"
    leading={<Icon icon={MailRead} />}
    trailing={<IconButton icon={Delete} label="Clear" onPress={() => setEmail('')} />}
  />
</BoxedList>
```

Row with an inline text entry field — mirrors `AdwEntryRow` and
`@gnome-ui/react`'s own `EntryRow`. The `title` rises above the input as a
small label once the field is focused or has content, and stands in for the
placeholder until then. Use it inside a `BoxedList` for settings that take
free-form text. Controlled (`value`) and uncontrolled (`defaultValue`) modes
both work, and every remaining `TextInput` prop passes through.

The float is one JS-driven `Animated.Value` (`useNativeDriver: false`):
`fontSize` is part of the transition and can't be native-driven, and mixing a
native with a JS value on one component throws — the same trade-off
`Expander` and `InlineViewSwitcher` already accepted. `useReducedMotion()`
snaps between the two states instead.

**The label's travel is measured, not hardcoded.** The web expresses the
resting position as `top: 50%; transform: translateY(-50%)` and the floated
one as `top: 6px`, but RN can't interpolate between a percentage and a fixed
offset — so the field reports its own height through `onLayout` and the
distance is derived from it, which also keeps the label centred if you make
the row taller than the 56 dp minimum.

The `:focus` inset ring is dropped rather than approximated. `TextField`'s
own precedent — recolor the border on focus — doesn't transfer, because an
`EntryRow` has no border of its own: it's a row inside a `BoxedList`, and
adding one would shift the list's geometry. On a touch device the state is
already unmistakable: the label floats up, the text fades in, and the
keyboard opens.

Two deliberate divergences from the web version. The visible label is hidden
from assistive tech and the `title` becomes the input's `accessibilityLabel`
— RN has no `<label htmlFor>`, so otherwise the label would be announced as
loose text next to an unnamed field (pass `accessibilityLabel` to override).
And `testID` lands on the row rather than the input, matching every other
component in this package; reach the field itself by its accessible name.

### PasswordEntryRow

```tsx
import { PasswordEntryRow } from '@gnome-ui/react-native';

<BoxedList>
  <PasswordEntryRow title="Password" value={password} onValueChange={setPassword} />

  {/* Registration and change-password forms */}
  <PasswordEntryRow
    title="New password"
    value={next}
    onValueChange={setNext}
    autoComplete="new-password"
  />
</BoxedList>
```

Password entry row with a built-in reveal/conceal toggle — mirrors
`AdwPasswordEntryRow` and `@gnome-ui/react`'s own `PasswordEntryRow`. It's an
`EntryRow` that masks its input and always carries a trailing button to show
or hide what's been typed, so don't add your own through `trailing` — that
slot is for anything that should sit *before* the reveal button.

`type={revealed ? 'text' : 'password'}` becomes RN's `secureTextEntry`, and
`autoComplete` defaults to `"current-password"`, which is what lets password
managers and the platform keyboard offer a saved credential.

The reveal control is the already-shipped `IconButton` rather than a
hand-rolled pressable, which costs one visual detail: `IconButton` is
circular (it's `Button` at `shape="circular"`) where the web's
`.revealButton` is a 32 dp square with a 6 dp radius. A circular flat icon
button is the idiomatic touch control and keeps the row consistent with every
other icon action here. The CSS's resting `opacity: 0.55` is dropped too — it
exists so the button can brighten on hover, and with no hover on a touch
device a permanently dimmed control is just harder to see.

The web needs `e.stopPropagation()` so pressing the button doesn't also
trigger the row's focus-the-input click. RN's responder system routes a touch
to the innermost pressable, so there's nothing to stop.

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

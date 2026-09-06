# Roadmap — @gnome-ui/react-native

Component porting plan from `@gnome-ui/react` (130 components across the
main [ROADMAP.md](../../ROADMAP.md)) to React Native. Tier numbers below
match the main roadmap's numbering exactly, for cross-reference — this file
tracks RN-specific status per tier rather than renumbering.

No DOM to reuse from the web version, so every component is **rebuilt**
with native primitives (`View`, `Text`, `Pressable`, `StyleSheet`/inline
styles) rather than ported 1:1 — mirroring the React version's component
API/props only where the platforms overlap. Standing constraints that
shape every "pending" row below:

- **No CSS media queries** — `useBreakpoint`/viewport-driven adaptive
  layout needs a from-scratch RN implementation on `useWindowDimensions`.
- **No keyboard on a touch-first device** — arrow-key roving-tabindex,
  `Tab`/`Shift+Tab` focus-trapping, and `Escape` all drop; VoiceOver/
  TalkBack's `adjustable` trait + `accessibilityActions` is the nearest
  native analog where one exists (established by `Slider`/`SpinButton`).
- **No DOM `Portal`** — RN's own `Modal` already floats above everything
  with no target needed; every floating component (`Dialog`, `Tooltip`,
  `Dropdown`, `Popover`) already handles this itself, so a standalone
  `Portal` component has no RN counterpart to extract.
- **No drag-and-drop / native file picker** — anything built on HTML5
  drag events or `<input type="file">` needs a real redesign around a
  document/photo-picker flow (`expo-document-picker`), not a port.

Legend: ✅ Done · ⬜ Pending · 🚫 Deferred / not planned

---

## Tier 1 — Base ✅ (7/7)

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | Button | + `raised` variant, `osd` modifier, `pill`/`circular` shape — shipped ahead of Tier 8 |
| ✅ | Text | All 12 Adwaita styles |
| ✅ | Link | |
| ✅ | TextField | |
| ✅ | Switch | |
| ✅ | Checkbox | |
| ✅ | RadioButton | |

## Tier 2 — Layout & Containers ✅ (5/5)

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | Separator | |
| ✅ | Card | |
| ✅ | BoxedList | + `variant="separate"` — shipped ahead of Tier 8 |
| ✅ | ActionRow | + `variant="property"` — shipped ahead of Tier 8 |
| ✅ | HeaderBar | |

## Tier 3 — Navigation ✅ (5/5)

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | Tabs / TabBar | |
| ✅ | ViewSwitcher | |
| ✅ | Sidebar | + `collapsed` (rail mode) and `filter` — shipped ahead of Tiers 10/11 |
| ✅ | SearchBar | |
| ✅ | PathBar | |

## Tier 4 — Feedback ✅ (8/9, 1 skipped)

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | Spinner | |
| ✅ | ProgressBar | |
| ✅ | Skeleton | |
| ✅ | Toast / Toaster | |
| ✅ | Banner | |
| ✅ | Dialog | + `role="alertdialog"` / `responses` / `onResponse` (AlertDialog API) — shipped ahead of Tier 14 |
| ✅ | Tooltip | |
| ✅ | AnimatedIcon | Brought `Icon` along as its own public component |
| 🚫 | Status Page | Skipped by explicit user request (2026-09-03) |

## Tier 5 — Advanced Controls ✅ (6/6)

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | Dropdown | |
| ✅ | Slider | |
| ✅ | SpinButton | |
| ✅ | Avatar | |
| ✅ | Badge | |
| ✅ | Popover | Unblocks the `Popover`-anchored molecules in Tier 20 (`DatePicker`, `FontPicker`, `EmojiPicker`, `CoachMark`, …) |

---

## Tier 6 — Adaptive Layout ⬜ (0/5) — next up

> The real gap: nothing here exists yet, and `Sidebar`'s own adaptive
> `mode` prop (Tier 11) and `Sidebar` v2 (Tier 7) are both blocked on it.

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **`useBreakpoint`** | Needs a from-scratch RN build on `useWindowDimensions` + the same 400/550/860 sp thresholds — no CSS media query to lean on. Highest-priority item in this file: unblocks `Sidebar`'s `mode` prop, `Sidebar` v2, `ViewSwitcherSidebar`, and `BreakpointBin` |
| ⬜ | **Clamp** | Trivial once started — `maxWidth` + `alignSelf: 'center'`, no breakpoint dependency |
| ⬜ | **NavigationSplitView** | Two-pane sidebar+content that collapses to one pane at ≤ 400 sp — blocked on `useBreakpoint` |
| ⬜ | **OverlaySplitView** | Sidebar becomes a slide-over `Modal` at ≤ 400 sp — blocked on `useBreakpoint`; the slide-over itself reuses `Popover`/`Dropdown`'s `Modal` + reduced-motion fade recipe |
| ⬜ | **ViewSwitcherBar** | Bottom bar replacing header-bar `ViewSwitcher` at ≤ 550 sp — blocked on `useBreakpoint` |

## Tier 7 — GNOME 48–50 (libadwaita 1.7–1.9)

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **ToggleGroup** | Directly portable — `Pressable` row, same selection-state shape as `RadioButton`/`ViewSwitcher` |
| ⬜ | **WrapBox** | Directly portable — plain `flexWrap: 'wrap'` container. Prerequisite for `TagInput` (Tier 20) |
| ✅ | **Chip** | Shipped — selected background/border tint resolves to a literal 8-digit `#RRGGBBAA` hex (the `Highlight` precedent); `:hover`/`:active` collapse into one pressed-overlay tint (the `ActionRow`/`Card` recipe); leading/remove icons stay in the default foreground color rather than tracking the selected accent text, since `Icon` has no `currentColor` equivalent. Prerequisite for `TagInput` (Tier 20) |
| 🚫 | **ShortcutsDialog** | No keyboard shortcuts exist to list on a touch-first device — low value, not planned unless a specific need arises |
| ⬜ | **Sidebar (v2)** | Rewrite blocked on `useBreakpoint` (Tier 6) — named sections/context menus/tooltip are otherwise straightforward compositions of already-shipped pieces |
| ⬜ | **ViewSwitcherSidebar** | Blocked on `useBreakpoint` (Tier 6), same as `Sidebar` v2 |
| ⬜ | **BreakpointBin** | The per-*component* (container-query) sibling of `useBreakpoint` — same `useWindowDimensions`-adjacent build, but measures its own `onLayout` width instead of the window |
| ✅ | **Cross-cutting — high-contrast** | Already done: `useContrast`/`useResolvedContrast` + `highContrastTheme`/`highContrastDarkTheme` shipped with the theme system itself |
| ✅ | **Cross-cutting — Intl formatting** | Already done: `GnomeProvider` exposes `useLocale`/`useDir`/`useNumberFormatter`/`useDateTimeFormatter` |

## Tier 8 — Style-class Utilities & Composition Helpers

> Several of these already shipped as props on their host component ahead
> of tier order (marked below) — only the still-missing pieces are real
> gaps.

### Layout primitives

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **Toolbar** | Directly portable — flat-button row, `space1` gap |
| ⬜ | **Spacer** | Trivial — `flex: 1` `View` |
| ⬜ | **LinkedGroup** | Directly portable — connected-border trick already proven by `Dropdown`'s trigger border |
| ⬜ | **Frame** | Trivial — border + radius, no background |

### BoxedList / ActionRow variants

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **BoxedList `variant="separate"`** | Already shipped (Tier 2) |
| ⬜ | **ButtonRow** | Directly portable — full-width `Pressable` styled like `Button`, inside `BoxedList` |
| ✅ | **ActionRow `variant="property"`** | Already shipped (Tier 2) |
| ⬜ | **ExpanderRow** | Blocked on nothing — `ActionRow` + the standalone `Expander`'s (Tier 20, shipped) directly-driven `Animated.View` height recipe for the reveal, in place of the web version's animated-height CSS grid |

### Button additions

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **SplitButton** | Directly portable — `Button` + a second narrow chevron `Pressable`, connected-border trick from `LinkedGroup` |
| ✅ | **IconButton** | Shipped — `Button`'s `shape="circular"` + `Icon` + optional `Tooltip`, the exact same composition `@gnome-ui/react`'s own `IconButton` already is (its JSDoc example already showed this nesting directly). Built as a genuine prerequisite for `Drawer`'s `rail`, not scope creep |
| ✅ | **Button `raised` variant** | Already shipped (Tier 1) |
| ✅ | **Button `osd` modifier** | Already shipped (Tier 1) |
| ⬜ | **CopyButton** | Needs a new peer dependency — RN has no `navigator.clipboard`; `expo-clipboard` (Expo) or `@react-native-clipboard/clipboard` (bare RN) required first |

### View Switcher / Search / Tab additions

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **InlineViewSwitcher** | Directly portable once `ToggleGroup` ships — built on its internals in the web version too |
| ⬜ | **TabBar `inline` prop** | Trivial — drop the header-bar background color |
| ⬜ | **SearchBar `inline` prop** | Trivial, same as above |
| ⬜ | **SearchBar autocomplete** | Blocked on nothing now that `Popover` shipped (Tier 5) — reuses its positioning instead of the web version's own `Popover` |
| 🚫 | **StatusPage `compact` prop** | N/A — `StatusPage` itself is skipped in this package |

---

## Tier 9 — Stories & Composition Examples

🚫 Not applicable as written — this package has no Storybook. The
[`apps/react-native-example`](../../apps/react-native-example) Expo Go
gallery is the RN equivalent (one demo screen per component, added as each
ships), not full-page composition stories. Revisit as real composed
screens (a dashboard, a settings flow) once enough Tier 6–8 pieces exist to
make one worth building.

## Tier 10 — Sidebar Enhancements

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **Sidebar `collapsed` prop** | Already shipped (Tier 3) |

## Tier 11 — Sidebar 1.9 Completeness

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **Sidebar search/filter** | Already shipped as `filter` (Tier 3) — no built-in `SearchBar` pairing yet, same as the web version's own recommended pattern |
| ⬜ | **Sidebar adaptive `mode` prop** | Blocked on `useBreakpoint` (Tier 6) — explicitly dropped when `Sidebar` first shipped, flagged to revisit here |
| ⬜ | **SidebarItem drop target** | Web-only concept (HTML5 `DragEvent`) — would need `react-native-gesture-handler` to build a touch-drag equivalent from scratch; low priority until a concrete use case exists |

## Tier 12 — Boxed List Row Variants

> All five building blocks (`Switch`, `Dropdown`, `TextField`, `SpinButton`)
> already exist — these are now straightforward `ActionRow` compositions,
> not new primitives.

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **SwitchRow** | `ActionRow` + `Switch` as the end widget |
| ⬜ | **CheckRow** | Missing from this file's original pass, added retroactively. `ActionRow` + `Checkbox` as the end widget — same recipe as `SwitchRow`, both building blocks already shipped (Tier 1/Tier 2) |
| ⬜ | **ComboRow** | `ActionRow` + `Dropdown` |
| ⬜ | **EntryRow** | `ActionRow` with the subtitle area replaced by a `TextField` |
| ⬜ | **PasswordEntryRow** | `EntryRow` + a reveal-icon toggle, same recipe `PasswordField` (Tier 20) will need |
| ⬜ | **SpinRow** | `ActionRow` + `SpinButton` |

## Tier 13 — Preferences UI

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **PreferencesGroup** | Titled `BoxedList` wrapper — blocked on nothing, but most useful once Tier 12's rows exist |
| ⬜ | **PreferencesPage** | Scrollable stack of `PreferencesGroup` — trivial once it exists |
| ⬜ | **PreferencesDialog** | Multi-page settings `Dialog` — blocked on `PreferencesPage`; on mobile this more idiomatically wants `NavigationView`'s push/pop (Tier 14) than web tabs |

## Tier 14 — Missing Navigation & Overlays

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **NavigationView** | High mobile value (push/pop stack is the native navigation idiom) — but most RN apps already bring their own navigation library (React Navigation, Expo Router); scope this as a *styled primitive* for consumers without one, not a router replacement |
| ✅ | **BottomSheet** | Shipped with real drag-to-dismiss on core `PanResponder` (no new gesture dependency needed after all — `Slider`'s own drag technique generalizes) |
| ⬜ | **Carousel** | More portable than it looks — RN's built-in `ScrollView`/`FlatList` with `pagingEnabled` covers swipeable paging with no new dependency; `CarouselIndicatorDots`/`Lines` are simple derived dot rows |
| ✅ | **AlertDialog** | Already shipped as `Dialog`'s `role="alertdialog"` + `responses`/`onResponse` (Tier 4) |
| 🚫 | **AboutDialog** | Niche composite (app info/credits/legal tabs) — low priority, revisit if a consuming app actually needs an in-app "About" screen |

## Tier 15 — Layout & Utility Gaps

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **Bin** | Trivial — single-child passthrough `View`, mostly useful as internal plumbing |
| ⬜ | **ToolbarView** | `HeaderBar`/`ActionBar` pinned top or bottom around a scrolling middle — straightforward composition |
| ⬜ | **WindowTitle** | Trivial — two-line `Text` pairing for `HeaderBar`'s `start`/center slot |
| 🚫 | **ShortcutLabel** | No physical keyboard shortcuts to display on mobile — not planned |
| ⬜ | **ButtonContent** | Mostly redundant — `Button`'s existing `leadingIcon`/`trailingIcon` already covers icon+label layout; low priority unless a real gap surfaces |

---

## `@gnome-ui/icons` — Icon Library

🚫 Not a tier for this package — `@gnome-ui/icons` is already consumed
directly as a peer dependency (`Icon`/`AnimatedIcon`, Tier 4). No
RN-specific icon rebuild needed; `react-native-svg` renders the same
exported `IconDefinition` shapes the web version ships.

## Tier 16 — Platform Integration (`@gnome-ui/platform`, `@gnome-ui/hooks`)

🚫 Not applicable. Both packages bridge to GNOME via `WebKitGTK`'s
`window.webkit.messageHandlers` or a browser fallback — neither exists in
an RN runtime. A native-modules-based equivalent (e.g. wrapping
`expo-notifications`/`expo-clipboard`/`AsyncStorage` behind the same
hook shapes) would be a genuinely new package, not a port — out of this
file's scope unless separately requested.

## Tier 17 — `@gnome-ui/layout` Package

🚫 Out of scope for this package. A full-page app shell is normally owned
by the consumer's navigation library on RN (React Navigation, Expo
Router), not the design system. Revisit only if a concrete need for a
GnomeUI-styled shell primitive (distinct from routing) surfaces.

## GNOME 50 Compatibility

✅ The `prefers-reduced-motion` audit items don't apply as a batch the way
they did for the web version's shared CSS — every animated RN component in
this package already wires its own `useReducedMotion()` individually at
build time (`Spinner`, `ProgressBar`, `Skeleton`, `Toast`, `Dialog`,
`Dropdown`, `Popover`, `AnimatedIcon`), so there's no separate "audit" tier
to track here going forward — the same check just needs to happen on each
future animated component's own turn, which is already this package's
convention.

| Status | Component | Notes |
|--------|-----------|-------|
| 🚫 | **ColumnView** | Large surface area (sorting, virtualization) — needs its own design pass around `FlatList`; low mobile value for a design system component (most RN table needs are app-specific) |

## `@gnome-ui/charts` — Chart Components

🚫 Deferred as a block. All 23 chart components are built on Recharts
(SVG-over-DOM); RN has no equivalent renderer without a new native
charting dependency (e.g. Victory Native, `react-native-svg-charts`, or
hand-rolling on `react-native-svg` directly). Worth its own dedicated
initiative — not a natural fit for a single component's turn — once there
is a concrete consuming app that needs charts on mobile.

## Tier 18 — Data Display

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **SegmentedBar** | Shipped — missing from this file's first pass, added retroactively. Touch rebuild of the web's hover-to-dim/highlight interaction: each segment is a `Pressable` dimming its siblings on `onPressIn`/`onPressOut` (not gated behind `Tooltip`'s long-press delay), wrapped in `Tooltip` (ported 1:1) for the label/percentage readout. `filter: brightness()` on the touched segment has no RN port — dropped, since dimming the rest already reads as highlighting the one being touched |
| 🚫 | **ContributionGraph** | SVG-heavy 52-week calendar grid — low mobile value, same `react-native-svg`-from-scratch cost as the chart package above; bundle with that initiative rather than doing it alone |

## Tier 19 — Dashboard Components (`@gnome-ui/layout`)

🚫 Same reasoning as Tier 17 — these are `@gnome-ui/layout` package
components (`DashboardGrid`, `StatCard`, `ProgressCard`, `ActivityFeed`,
`QuickActions`, `SectionHeader`, `EmptyState`, `StatusIndicator`,
`ErrorState`), out of this package's scope. `EmptyState`/`ErrorState`
specifically would be near-trivial `StatusPage`-shaped compositions if
`StatusPage` itself weren't already skipped in this package.

## Tier 20 — Atomic & Molecular Gaps

### Atoms

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **LevelBar** | Shipped reusing `ProgressBar`'s exact `scaleX`-transform animation technique for the continuous fill; discrete mode's per-block color change is left unanimated (decorative nicety, not a gap) |
| ✅ | **Expander** | Shipped — single `Animated.View` with a directly-driven numeric `height` (`useNativeDriver: false`) replaces the web version's two-transition CSS grid trick, since the content `onLayout` measurement already folds in its own `paddingTop`; chevron is `PanEnd` rotating via the same `interpolate`-to-`rotate` recipe `Spinner` uses |
| ⬜ | **PasswordField** | Directly portable — `TextField` + reveal-icon toggle, same recipe `PasswordEntryRow` (Tier 12) needs |
| ✅ | **Divider** | Shipped — two flex-1 line `View`s flanking an optional `Text variant="caption" color="dim"` label; unlike `Separator`'s `accessible={false}`, this one carries `role="separator"` + `accessibilityLabel` since a labelled divider ("OR") is meant to be read aloud |
| ⬜ | **RatingStars** | Directly portable — tap-to-select row of `Icon`s (`Star`/`StarOutline`), roving-tabindex keyboard nav drops per this package's standing convention |
| ✅ | **FileTypeIcon** | Shipped — `fileType.ts`'s pure MIME/extension → category resolver duplicated verbatim from `@gnome-ui/react`; thumbnail reuses `Avatar`'s `Image`/`resizeMode="cover"` recipe, sized from `Icon`'s own size map |
| ⬜ | **Callout** | Directly portable — dismissible variant of `Banner`'s existing shape |
| ⬜ | **StepIndicator** | Directly portable — row of derived dots/numbers from `currentStep`, no internal state |
| ⬜ | **RangeSlider** | Dual-thumb version of the already-shipped `Slider` — same `PanResponder`/`locationX` technique, tracking two values instead of one |
| ⬜ | **TextTruncate** | The one atom needing real design work — RN has `numberOfLines` but no "did this actually truncate" overflow signal the way `ResizeObserver` gives the web version; likely needs an `onTextLayout` line-count comparison trick, wrapped in the already-shipped `Tooltip` when truncation is detected |
| 🚫 | **Kbd** | No physical keyboard on mobile to reference — not planned, same reasoning as `ShortcutLabel`/`ShortcutsDialog` |
| ✅ | **Highlight** | Shipped — outer themed `Text` wraps matched runs in plain (unthemed) nested RN `Text`, relying on RN's ambient style inheritance for nested `Text` so a run only overrides `backgroundColor`/`fontWeight` instead of resetting to `variant="body"`; the web's `color-mix()` translucent background resolves to a literal 8-digit `#RRGGBBAA` hex |
| ⬜ | **VisuallyHidden** | This package already has the underlying recipe inline on every component that needs it (`accessibilityElementsHidden` + `importantForAccessibility="no"`, first established by `PathBar`) — extracting a reusable wrapper is a quick win, not new design |
| ✅ | **Overlay** | Extracted as a new standalone primitive (`Dialog`'s backdrop recipe + `BottomSheet`'s timed-exit-animation technique); not retrofitted into `Dialog`/`Dropdown`/`Popover`/`BottomSheet` themselves — each keeps its own already-shipped, already-tested inline copy |
| ⬜ | **Box** | Missing from this file's original pass, added retroactively (found via a full word-boundary cross-check of every `packages/react/src/components` folder against this file, 2026-09-06 — see the Summary). Trivial — `View` + `flexDirection`/`gap` from the same `BoxSpacing` scale already used elsewhere |
| ⬜ | **Blockquote** | Missing from original pass, added retroactively. Trivial — `View` with a colored left border (per-side `borderColor` already established by `Spinner`'s ring/`Tooltip`'s arrow) + `Text`, no state |
| ⬜ | **StatusBadge** | Missing from original pass, added retroactively. General-purpose status pill (success/warning/error/new/accent/neutral) — simpler sibling of the already-shipped `Badge` (no anchor/dot mode, no counter), same color-token mapping |
| ⬜ | **Footer** | Missing from original pass, added retroactively. Bottom bar with leading/trailing/center slots — directly reuses `HeaderBar`'s already-shipped `flex: 1` on both side slots trick so the center content stays centered regardless of slot width |

### Molecules

> `Calendar` is the real prerequisite for four of these — build it first.

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **Calendar** | The real design effort here — month-grid keyboard-nav-free (roving-tap instead) date grid; blocks `DatePicker`/`TimePicker`/`CalendarRange`/`DateRangePicker` below |
| ⬜ | **DatePicker** | Unblocked now that `Popover` shipped (Tier 5) — `TextField` trigger + `Popover`-anchored `Calendar`; blocked only on `Calendar` itself |
| ⬜ | **TimePicker** | Paired `SpinButton` columns in a `Popover` — blocked only on scheduling, all pieces exist |
| ⬜ | **CalendarRange** | Shares `Calendar`'s grid engine — blocked on `Calendar` |
| ⬜ | **DateRangePicker** | `Popover` + `CalendarRange` composition — blocked on `CalendarRange` |
| ⬜ | **FontPicker** | Unblocked now that `Popover`+`Dropdown`+`SpinButton` all exist — thin glue composition |
| ⬜ | **EmojiPicker** | Unblocked now that `Popover` exists — needs the same static emoji dataset the web version ships, `ScrollView`+search-filter |
| ⬜ | **TagInput** | Blocked on `WrapBox` + `Chip` (Tier 7) |
| ⬜ | **OtpInput** | Directly portable — N `TextInput` cells, auto-advance via `onChangeText` + `ref.focus()`, no web-only APIs involved |
| ⬜ | **CopyField** | Blocked on `CopyButton`'s clipboard dependency (Tier 8) |
| ⬜ | **ChoiceCardGroup** | Directly portable — roving-selection group of `Card`s, same recipe `RadioButton` already established |
| ⬜ | **FileDropZone** | Needs reimagining, not a port — "drag and drop" has no touch equivalent; the mobile-idiomatic shape is a tap target opening `expo-document-picker`/`expo-image-picker`, a new peer dependency |
| ⬜ | **MultiSelectDropdown** | Unblocked now that `Dropdown` exists (Tier 5) — checkbox-list variant of the same `Modal` + backdrop pattern |
| ⬜ | **CodeBlock** | Directly portable — monospace `Text` block + optional line numbers, `theme.fontFamilyMono` already exists |
| ⬜ | **WidgetManager** | Low priority — complex composite (catalog picker, staged add/remove); revisit only if a concrete dashboard/widget use case appears |
| ✅ | **Drawer** | Missing from this file's original pass, added retroactively (found the same way `SegmentedBar` was). Slide-in panel anchored left/right, floats with a margin on every side (all four corners rounded, mirroring the `@gnome-ui/react` source's own recent CSS update) via `justifyContent` on the backdrop rather than the web CSS's `margin: auto` — confirmed on-device with saturated debug colors, since RN auto-margin support was unverified for this Yoga version. No drag-to-dismiss (the web source has no exit keyframes either), so it follows `Dialog`'s simpler animation shape rather than `BottomSheet`'s. `DrawerDepthContext` (nested-drawer width auto-scaling) ports 1:1, pure React state. `rail` unblocked the new `IconButton` (see Tier 8) |
| ⬜ | **FieldGroup** | Directly portable — generic labeled-group wrapper, simpler than `PreferencesGroup` (Tier 13) |
| 🚫 | **Portal** | No RN counterpart to extract — every floating component already owns its `Modal` internally (see the standing constraints at the top of this file) |
| ⬜ | **CoachMark** | Directly portable now that `Popover`'s positioning math exists — spotlight + anchored callout bubble, `CoachMarkTour` orchestrator is plain state on top |
| ✅ | **AvatarGroup** | Shipped — overlapping stack of the already-shipped `Avatar`, plus a "+N" overflow chip reusing `Avatar`'s own per-size box dimensions. The web's two-layered `box-shadow` ring (inset hairline + outset window-colored ring) collapses to a single `borderWidth: 2` override, since RN gives a `View` only one border — kept the outer separating ring, since that's the one doing the actual distinguish-overlapping-avatars work |
| ⬜ | **AvatarRotator** | Missing from original pass, added retroactively. Directly portable — timed rotation through a list of avatar images/initials, reusing `Avatar` and this package's own `useReducedMotion()` (the web version's `usePrefersReducedMotion` import is `@gnome-ui/hooks`-specific, not relevant here) |
| ⬜ | **ColorPicker** | Missing from original pass, added retroactively. Molecule-level effort — swatch grid (`Pressable` circles, `selected` ring) + a custom-color entry field; no native color-picker API to lean on either platform |
| ⬜ | **CountDownTimer** | Missing from original pass, added retroactively. Directly portable — plain interval-driven countdown state, already has `useDateTimeFormatter` available via `GnomeProvider` for formatting |
| ⬜ | **ScrollToTop** | Missing from original pass, added retroactively. Needs reimagining, not a straight port — RN has no page-level scroll event; the mobile shape is a prop taking the consumer's own `ScrollView` scroll-offset (via `onScroll`), not an internally-observed `window.scroll` listener |
| ⬜ | **TerminalView** | Missing from original pass, added retroactively. Directly portable — monospace `Text` lines in a `ScrollView`, `scrollToEnd()` on the ref for `autoScroll`. Distinct from `CodeBlock` above (static snippet) the same way the web version documents it |
| ⬜ | **Timeline** | Missing from original pass, added retroactively. Directly portable — `View`-based vertical/horizontal list of connector-line + icon nodes, no web-only APIs involved |

---

## Domain-specific components (not in any tier)

`AffectedPackage`, `CveIdentifier`, `CvssScore`, `CvssVector`,
`CweIdentifier`, `SecurityMetric`, `SeverityBadge`, `VulnerabilityFinding`,
`VulnerabilitySummary` exist in `@gnome-ui/react` but were never part of
the main ROADMAP.md's tier system — bespoke widgets for a specific
security/vulnerability-reporting product surface, not GNOME HIG patterns.
(`SeverityBadge` added 2026-09-06 — same reasoning as the rest of this
list, its own docstring says "for vulnerability and security report
surfaces" explicitly; not to be confused with the general-purpose
`StatusBadge`, tracked in Tier 20 above.) 🚫 Out of scope here unless a
concrete consuming app needs them on mobile.

## React-only originals (not GNOME HIG ports)

`FilterableMultiSelectDropdown` exists in `@gnome-ui/react` but isn't a
port target for this file at all — it's an original component invented
for that package specifically (a `MultiSelectDropdown` variant with a
built-in search field), not a mirror of any GNOME/libadwaita widget.
Excluded from the tier system by design, not an oversight — if this
package ever wants the same shape, it'd extend `MultiSelectDropdown`
(Tier 20) once that ships, not port this one directly.

---

## Infrastructure

🚫 `@gnome-ui/hooks` tree-shaking (main ROADMAP.md's Infrastructure section)
is `@gnome-ui/react`-specific bundler config — not applicable to this
package.

---

## Summary

- **Shipped**: Tiers 1–5 complete (31 components + `GnomeProvider`/theme),
  plus `BottomSheet` (Tier 14) — real `PanResponder` drag-to-dismiss, no new
  gesture dependency needed — and `Overlay`/`LevelBar`/`Expander`/`Divider`/
  `Highlight`/`FileTypeIcon` (Tier 20), plus `SegmentedBar` (Tier 18,
  missing from this file's original pass — added retroactively; touch
  rebuild of the web's hover-to-dim/highlight via each segment's own
  `Pressable` `onPressIn`/`onPressOut`, composed with a ported-1:1
  `Tooltip` per segment for the label/percentage readout). `Overlay` was
  extracted as a new
  standalone primitive rather than retrofitted into the four components
  that still each keep their own inline copy of the same pattern;
  `LevelBar` reuses `ProgressBar`'s `scaleX`-transform animation technique
  verbatim; `Expander` replaces the web version's two-transition CSS grid
  reveal with a single directly-driven `Animated.View` height; `Divider` is
  the first `role="separator"` component in the package that actually stays
  in the accessibility tree (unlike `Separator`'s `accessible={false}`),
  since its label is real content; `Highlight` leans on RN `Text`'s
  (uniquely, among RN primitives) ambient style inheritance when nested, so
  a matched run only overrides `backgroundColor`/`fontWeight` instead of
  resetting to a default variant; `FileTypeIcon` duplicates
  `@gnome-ui/react`'s pure MIME/extension resolver verbatim and reuses
  `Avatar`'s own `Image` thumbnail recipe. Also shipped, from Tier 7:
  `Chip` — selected-state tint via the same `Highlight`-precedent
  8-digit-hex trick, hover/active collapsed into `ActionRow`/`Card`'s
  pressed-overlay recipe, and a first (documented) instance of an icon
  deliberately NOT tracking a dynamic accent color since `Icon` has no
  `currentColor` equivalent. Also shipped: `IconButton` (Tier 8) —
  `Button`+`Icon`+optional `Tooltip`, the exact composition
  `@gnome-ui/react`'s own `IconButton` already is — built as a genuine
  prerequisite for `Drawer` (also shipped, missing from this file's
  original pass like `SegmentedBar`), whose `rail` needed it. `Drawer`
  floats with a margin on every side via `justifyContent` on the backdrop
  (not the web CSS's `margin: auto`, unverified for this RN/Yoga version —
  confirmed correct on-device with saturated debug colors before trusting
  it) and has no drag-to-dismiss, following `Dialog`'s simpler animation
  shape since the web source defines no exit keyframes. Also shipped:
  `AvatarGroup` (Tier 20) — the web's two-layered ring (inset hairline +
  outset window-colored ring) collapses to one `borderWidth: 2` override
  on each `Avatar`, since RN gives a `View` only one border.
- **Full inventory pass (2026-09-06)**: ran `ls packages/react/src/components`
  (130 folders) against a word-boundary grep of this file end to end,
  following up on the partial check that first caught `SegmentedBar`/
  `Drawer` missing. Found 14 more real gaps and added all of them above:
  `CheckRow` (Tier 12), `Box`/`Blockquote`/`StatusBadge`/`Footer` (Tier 20
  atoms), `AvatarGroup`/`AvatarRotator`/`ColorPicker`/`CountDownTimer`/
  `ScrollToTop`/`TerminalView`/`Timeline` (Tier 20 molecules),
  `SeverityBadge` (Domain-specific — confused with the now-tracked
  general-purpose `StatusBadge` at first glance, they're unrelated
  components), and `FilterableMultiSelectDropdown` (a deliberate exclusion,
  not a gap — an original `@gnome-ui/react`-only component, no GNOME HIG
  counterpart to port). This word-boundary-grep-every-folder-name method is
  now confirmed to reliably surface real gaps twice in a row — worth
  re-running after any batch of upstream `@gnome-ui/react` additions, not
  just once.
- **Next real gap**: Tier 6 (`useBreakpoint` first — it unblocks the most
  downstream items: `Sidebar` v2, `ViewSwitcherSidebar`, `BreakpointBin`,
  `Sidebar`'s own adaptive `mode`, `NavigationSplitView`, `OverlaySplitView`,
  `ViewSwitcherBar`).
- **Cheap, unblocked wins available right now** (no missing prerequisite):
  Tier 7's remaining `ToggleGroup`/`WrapBox`; Tier 8's `Toolbar`/`Spacer`/
  `LinkedGroup`/`Frame`/`ExpanderRow`; all of Tier 12's row composites;
  Tier 14's remaining `NavigationView`/`Carousel`; most of Tier 20's
  remaining atoms, plus the `Popover`-unblocked molecule cluster
  (`DatePicker`/`TimePicker`/`FontPicker`/`EmojiPicker`/`CoachMark`, once
  `Calendar` exists for the first two).
- **Whole-package deferrals**: `@gnome-ui/charts`, `@gnome-ui/platform`,
  `@gnome-ui/hooks`, `@gnome-ui/layout`'s components, `ContributionGraph`,
  `ColumnView` — each is its own initiative, not a single-component turn.

Per-component process for anything picked up from this file: read the
`@gnome-ui/react` source first, design the RN API deliberately rather than
transliterating props, check this package's own standing pitfalls
proactively (accessibility-role substitutions, `Modal`-as-portal,
`useReducedMotion`, the `View`+`accessibilityRole`-needs-`accessible`-too
gotcha), write the component + Jest test + example-app demo screen, verify
on the iOS Simulator, then update this file's row and the package README.

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
| ⬜ | **Chip** | Directly portable, no blockers. Prerequisite for `TagInput` (Tier 20) |
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
| ⬜ | **ExpanderRow** | Blocked on nothing — `ActionRow` + the same "stays mounted, toggle `display: 'none'`" pattern `TabPanel`/`SidebarSection` already use instead of an animated-height CSS grid |

### Button additions

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **SplitButton** | Directly portable — `Button` + a second narrow chevron `Pressable`, connected-border trick from `LinkedGroup` |
| ⬜ | **IconButton** | `Button`'s `shape="circular"` already covers the visual shape; still needs its own named export bundling `Icon` sizing + optional `Tooltip` composition |
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
| ⬜ | **LevelBar** | Directly portable — discrete-zone variant of `ProgressBar`'s existing fill math |
| ⬜ | **Expander** | Directly portable — standalone version of the disclosure pattern `ExpanderRow` (Tier 8) will also need |
| ⬜ | **PasswordField** | Directly portable — `TextField` + reveal-icon toggle, same recipe `PasswordEntryRow` (Tier 12) needs |
| ⬜ | **Divider** | Trivial — `Separator` + a centered `Text` label |
| ⬜ | **RatingStars** | Directly portable — tap-to-select row of `Icon`s (`Star`/`StarOutline`), roving-tabindex keyboard nav drops per this package's standing convention |
| ⬜ | **FileTypeIcon** | Directly portable — MIME/extension → `Icon` lookup table, pure JS |
| ⬜ | **Callout** | Directly portable — dismissible variant of `Banner`'s existing shape |
| ⬜ | **StepIndicator** | Directly portable — row of derived dots/numbers from `currentStep`, no internal state |
| ⬜ | **RangeSlider** | Dual-thumb version of the already-shipped `Slider` — same `PanResponder`/`locationX` technique, tracking two values instead of one |
| ⬜ | **TextTruncate** | The one atom needing real design work — RN has `numberOfLines` but no "did this actually truncate" overflow signal the way `ResizeObserver` gives the web version; likely needs an `onTextLayout` line-count comparison trick, wrapped in the already-shipped `Tooltip` when truncation is detected |
| 🚫 | **Kbd** | No physical keyboard on mobile to reference — not planned, same reasoning as `ShortcutLabel`/`ShortcutsDialog` |
| ⬜ | **Highlight** | Directly portable — pure string-split-and-styled-`Text` rendering, stateless |
| ⬜ | **VisuallyHidden** | This package already has the underlying recipe inline on every component that needs it (`accessibilityElementsHidden` + `importantForAccessibility="no"`, first established by `PathBar`) — extracting a reusable wrapper is a quick win, not new design |
| ✅ | **Overlay** | Extracted as a new standalone primitive (`Dialog`'s backdrop recipe + `BottomSheet`'s timed-exit-animation technique); not retrofitted into `Dialog`/`Dropdown`/`Popover`/`BottomSheet` themselves — each keeps its own already-shipped, already-tested inline copy |

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
| ⬜ | **FieldGroup** | Directly portable — generic labeled-group wrapper, simpler than `PreferencesGroup` (Tier 13) |
| 🚫 | **Portal** | No RN counterpart to extract — every floating component already owns its `Modal` internally (see the standing constraints at the top of this file) |
| ⬜ | **CoachMark** | Directly portable now that `Popover`'s positioning math exists — spotlight + anchored callout bubble, `CoachMarkTour` orchestrator is plain state on top |

---

## Domain-specific components (not in any tier)

`AffectedPackage`, `CveIdentifier`, `CvssScore`, `CvssVector`,
`CweIdentifier`, `SecurityMetric`, `VulnerabilityFinding`,
`VulnerabilitySummary` exist in `@gnome-ui/react` but were never part of
the main ROADMAP.md's tier system — bespoke widgets for a specific
security/vulnerability-reporting product surface, not GNOME HIG patterns.
🚫 Out of scope here unless a concrete consuming app needs them on mobile.

---

## Infrastructure

🚫 `@gnome-ui/hooks` tree-shaking (main ROADMAP.md's Infrastructure section)
is `@gnome-ui/react`-specific bundler config — not applicable to this
package.

---

## Summary

- **Shipped**: Tiers 1–5 complete (31 components + `GnomeProvider`/theme),
  plus `BottomSheet` (Tier 14) — real `PanResponder` drag-to-dismiss, no new
  gesture dependency needed — and `Overlay` (Tier 20), extracted as a new
  standalone primitive rather than retrofitted into the four components
  that still each keep their own inline copy of the same pattern.
- **Next real gap**: Tier 6 (`useBreakpoint` first — it unblocks the most
  downstream items: `Sidebar` v2, `ViewSwitcherSidebar`, `BreakpointBin`,
  `Sidebar`'s own adaptive `mode`, `NavigationSplitView`, `OverlaySplitView`,
  `ViewSwitcherBar`).
- **Cheap, unblocked wins available right now** (no missing prerequisite):
  Tier 7's `ToggleGroup`/`WrapBox`/`Chip`; Tier 8's `Toolbar`/`Spacer`/
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

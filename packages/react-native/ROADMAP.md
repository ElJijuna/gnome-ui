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

## Tier 4 — Feedback ✅ (10/10)

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
| ✅ | Icon | Shipped alongside `AnimatedIcon` as its own independently-usable public component — given its own row here since it never had one, not because it shipped separately |
| ✅ | StatusPage | Un-skipped and shipped 2026-09-06 — the original skip (2026-09-03) was reversed once [`MyNpmLens`](https://github.com/ElJijuna/MyNpmLens) turned out to depend on it in four places. The title renders as `Text variant="title-1"`, which also gives it the `header` accessibility role, diverging from the web version's `<p class="title">` — that `<p>` exists because HTML forces a concrete `h1`–`h6` level on a component that can't know where it sits in the outline, while RN's `header` role carries no level, so the dilemma disappears. `max-width: 36ch` on the description resolves as 0.5em per `ch` against that variant's own font size (288 dp body / 216 dp caption), keeping the measure font-relative the way the CSS is instead of freezing one pixel value that `compact` would get wrong. The action area is a `WrapBox` (Tier 7) rather than a hand-rolled row — `.actions` is a centred wrapping flex row with a gap and nothing else, which is precisely what that component already is |

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

## Tier 6 — Adaptive Layout ⬜ (1/5) — next up

> The real gap: nothing here exists yet, and `Sidebar`'s own adaptive
> `mode` prop (Tier 11) and `Sidebar` v2 (Tier 7) are both blocked on it.

| Status | Component | Notes |
|--------|-----------|-------|
| ⬜ | **`useBreakpoint`** | Needs a from-scratch RN build on `useWindowDimensions` + the same 400/550/860 sp thresholds — no CSS media query to lean on. Highest-priority item in this file: unblocks `Sidebar`'s `mode` prop, `Sidebar` v2, `ViewSwitcherSidebar`, and `BreakpointBin` |
| ✅ | **Clamp** | Shipped — `maxWidth` + `alignSelf: 'center'` (not `marginHorizontal: 'auto'`, following `Drawer`'s own resolution when RN auto-margin support was left unverified for this Yoga version); the trade-off is that `Clamp` needs a column-direction parent, since `alignSelf` acts on the cross axis. `tighteningThreshold` is implemented as a real percentage width rather than ported as-is: `@gnome-ui/react` declares and documents the prop but never passes it to the DOM, so mirroring it 1:1 would have shipped a dead prop |
| ⬜ | **NavigationSplitView** | Two-pane sidebar+content that collapses to one pane at ≤ 400 sp — blocked on `useBreakpoint` |
| ⬜ | **OverlaySplitView** | Sidebar becomes a slide-over `Modal` at ≤ 400 sp — blocked on `useBreakpoint`; the slide-over itself reuses `Popover`/`Dropdown`'s `Modal` + reduced-motion fade recipe |
| ⬜ | **ViewSwitcherBar** | Bottom bar replacing header-bar `ViewSwitcher` at ≤ 550 sp — blocked on `useBreakpoint` |

## Tier 7 — GNOME 48–50 (libadwaita 1.7–1.9)

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **ToggleGroup** | Shipped with `ToggleGroupItem` — context + `value`/`onValueChange` port 1:1 (pure React), while the web's `onKeyDown` ←/→/Home/End roving-`tabIndex` layer drops per this package's standing touch-first convention. The three `color-mix(accent N%, transparent)` values resolve to 8-digit `#RRGGBBAA` hexes off `theme.accentBgColor` (`Chip`'s precedent, and the same selected-tint problem), the `inset` box-shadow ring becomes a real `borderWidth: 1` every item carries at all times so selection never shifts layout (`AvatarGroup`'s precedent), and `box-shadow: shadow-sm` drops entirely — the theme generator keeps shadows in `raw` only and `Card` already settled that a border does this job on RN. **The group sets `accessibilityRole="radiogroup"` but deliberately not `accessible`**: on iOS `accessible` on a container collapses the subtree into one element and would make the toggles unreachable for VoiceOver. Unblocks `InlineViewSwitcher` (Tier 8) |
| ✅ | **WrapBox** | Shipped — `flexDirection: 'row'` + `flexWrap`, with the CSS shorthand `gap: <row> <column>` split into RN's separate `rowGap`/`columnGap` (the single `gap` property sets both, which is exactly what `childSpacing`-vs-`lineSpacing` has to be able to avoid). The web version's `--wrapbox-*` CSS custom properties have nothing to port to — that indirection only exists because a CSS module can't take runtime values; here the values go straight onto the style object. Reuses `Box`'s `start`/`end` → `flex-start`/`flex-end` mapping, duplicated rather than shared: two small pure lookups, and `WrapBoxAlign` is deliberately narrower than `BoxAlign` (no `baseline`), mirroring the web package's own two separate types. Unblocks `TagInput` (Tier 20) now that `Chip` has also shipped. **Real bug found by the on-device screenshot check**: `align="stretch"` rendered nothing at all, because CSS defaults `align-content` to `stretch` while Yoga defaults it to `flex-start` — with `flexWrap` on and children carrying no cross-size of their own, the line collapsed to zero height before `alignItems` could stretch anything into it. Fixed by setting `alignContent: 'stretch'` explicitly (a no-op whenever the container hugs its content, which is the ordinary case); neither package exposes an `alignContent` prop, so this is restoring the web default rather than adding API |
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
| ✅ | **ButtonRow** | Shipped — full-width `Pressable`, same pressed-overlay recipe `ActionRow`/`Card` already established. Title reuses `Text`'s own `TextColor` union (`"accent"`/`"destructive"` already resolve to the exact tokens the source CSS's `suggested`/`destructive` variants reference) instead of a separate color table. Title gets `flex: 1` + `textAlign: 'center'` (ported straight from the source CSS's `.title`) rather than centering the row via `justifyContent`, so the label stays centered even with only one of `leading`/`trailing` present — same `HeaderBar` symmetric-slot trick. Variant color doesn't propagate to `leading`/`trailing` icons (no `currentColor` equivalent), same dropped nicety as `Chip` |
| ✅ | **ActionRow `variant="property"`** | Already shipped (Tier 2) |
| ✅ | **ExpanderRow** | Shipped — reused the standalone `Expander`'s exact `Animated.View` height-driven reveal recipe (natural-height-until-first-measurement guard, `accessibilityElementsHidden`/`importantForAccessibility` standing in for `inert`, reduced-motion handling) almost verbatim, only swapping the chevron from `Expander`'s `PanEnd` triangle (0→90deg) to `PanDown` (0→180deg) to match the source CSS's straight down-arrow — the same icon/rotation pair `Dropdown`'s own chevron already established. Nested children get a `Separator` before each one via `Children.toArray(children).filter(Boolean)`, reusing the real `Separator` component directly. No `disabled` prop — the source `@gnome-ui/react` component doesn't expose one either |

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
| ✅ | **InlineViewSwitcher** | Shipped with `InlineViewSwitcherItem` — all four variants (`default`/`flat`/`round`/`pill`) and all four overflow strategies. **Far more than the "directly portable once `ToggleGroup` ships" this row used to claim**: almost none of the mechanism ports. The sliding indicator can't read `offsetLeft`/`offsetWidth`, so each item reports its own `onLayout` up through the context and the indicator animates `translateX` + `width` on **one JS-driven animation** (`useNativeDriver: false` — `width` can't be native-driven and mixing drivers on one component throws; `scaleX` would have been native but distorts the corner radii the variants are defined by). `ResizeObserver` + `scrollWidth` vs `clientWidth` becomes the summed item measurements (RN leaves `flexShrink` at 0, so an overflowing row still reports natural widths) against the row's own `onLayout`, with the web's `naturalWidthRef` capture and 30 px hysteresis ported verbatim. `scroll-snap-align: start` has no RN style but the measured offsets feed `snapToOffsets` exactly. `overflow="menu"` reuses the shipped `BottomSheet`. **Bug found by the on-device screenshot check and fixed rather than ported**: the web applies its `.active` class to the menu trigger even though menu mode hides the indicator, painting `round`'s label in `accent-fg` (#fff) on a plain card — white on white; the RN trigger uses the idle color instead |
| ⬜ | **TabBar `inline` prop** | Trivial — drop the header-bar background color |
| ⬜ | **SearchBar `inline` prop** | Trivial, same as above |
| ⬜ | **SearchBar autocomplete** | Blocked on nothing now that `Popover` shipped (Tier 5) — reuses its positioning instead of the web version's own `Popover` |
| ✅ | **StatusPage `compact` prop** | Shipped with `StatusPage` itself (Tier 4) — padding, icon size, title variant, description variant/measure, and both action-area gaps all scale together, matching the web's `.compact` block value for value |

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
| ✅ | **CheckRow** | Shipped — not literally `ActionRow` + `Checkbox` composition as this row's original note guessed: the source web component hand-rolls its own checkbox visual at the *leading* edge, with the whole row itself as the single button. Ported as one `Pressable` (`ActionRow`'s row/pressed-overlay recipe) containing a plain, non-interactive `View` that reuses `Checkbox`'s exact border/background `Animated.Value` interpolation and checkmark-fade-in — not the real `Checkbox` component, since nesting one `Pressable` inside another would create two overlapping tap targets. Controlled/uncontrolled `checked`/`defaultChecked` mirrors the `isControlled` shape already established by `Expander`/`ComboRow`/`Popover`. `aria-labelledby` has no RN equivalent — `accessibilityLabel` combines title+subtitle instead |
| ✅ | **ComboRow** | Shipped as exactly that composition — which is **not** what the web version does: it hand-rolls its own listbox inline, ~200 lines re-implementing the trigger, flip-up placement, outside-click dismissal, roving `aria-activedescendant` and the whole keyboard layer, none of it meaningfully different from that package's own `Dropdown`. Nothing forced the duplication visually either — `.row` is `ActionRow`'s exact metrics (12/24 dp padding, 52 dp min-height) and `.trigger` is `Dropdown`'s exact trigger (card background, 1 px shade border turning accent when open, `radius-md`, chevron) — so composing the two shipped components brings the flip-to-fit placement, tap-outside dismissal and `Modal`-based list along for free. `Dropdown` is controlled-only, so the uncontrolled `defaultValue` state lives in `ComboRow`. **Latent gap found in `ActionRow`**: its `disabled` prop only dims in the `interactive` branch — on a plain row it reaches a `View` that ignores it — so the dimming is applied here instead; worth fixing in `ActionRow` itself |
| ✅ | **EntryRow** | Shipped — built directly on `TextInput`, not on `ActionRow`+`TextField` as this row predicted: the floating label *is* the row's title, so there's no subtitle slot to replace and no second bordered field to nest. The float is one JS-driven `Animated.Value` (`fontSize` is part of the transition and can't be native-driven), and **the label's travel is measured rather than hardcoded** — RN can't interpolate between the web's `top: 50%` resting position and its `top: 6px` floated one, so the field reports its own height through `onLayout` and the distance is derived, which also keeps the label centred if a consumer makes the row taller than 56 dp. The `:focus` inset ring is dropped: `TextField`'s recolor-the-border precedent doesn't transfer, since an `EntryRow` has no border of its own and adding one would shift the `BoxedList`'s geometry — on touch the state is unmistakable anyway (label floats, text fades in, keyboard opens). Two deliberate divergences: the visible label is hidden from assistive tech and `title` becomes the input's `accessibilityLabel` (RN has no `<label htmlFor>`, so otherwise the label reads as loose text beside an unnamed field), and `testID` lands on the row rather than the input, matching every other component here. Unblocks `PasswordEntryRow` |
| ✅ | **PasswordEntryRow** | Shipped — `EntryRow` + a reveal toggle, exactly the composition this row predicted. `type={revealed ? 'text' : 'password'}` becomes `secureTextEntry`, and `autoComplete="current-password"` ports as-is (RN accepts the same value, and it's what lets a password manager or the platform keyboard offer a saved credential). The reveal control reuses the shipped `IconButton` rather than a fifth hand-rolled flat pressable, at the cost of one visual detail: `IconButton` is circular where `.revealButton` is a 32 dp square with a 6 dp radius. Its resting `opacity: 0.55` is dropped as well — that exists so the button can brighten on hover, and with no hover on touch a permanently dimmed control is just harder to see. The web's `e.stopPropagation()` has nothing to port to: RN's responder system already routes the press to the innermost pressable, so the row's focus-the-input handler never fires. Establishes the recipe `PasswordField` (Tier 20) needs |
| ⬜ | **SpinRow** | `ActionRow` + `SpinButton` |

## Tier 13 — Preferences UI

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **PreferencesGroup** | Shipped — pure layout/labelling wrapper, no `BoxedList` of its own. The web's empty `.content` div looks like dead markup but is load-bearing and is kept: the group is a 12 dp-gap flex column, so without that wrapper every child becomes a flex item of the group and picks up a 12 dp gap *between the rows*, instead of one gap between the header and the content as a whole. The title is `Text variant="body"` with an explicit semibold weight rather than `variant="heading"`, which is body-sized but bold and on the tighter heading line-height — `.title` is specifically semibold at the body line-height; it keeps the `header` role anyway (passed explicitly), the same call `StatusPage` makes. `min-width: 0` needs no port: it's the CSS flexbox min-content override that Yoga doesn't apply in the first place. Unblocks `PreferencesPage` |
| ⬜ | **PreferencesPage** | Unblocked — `PreferencesGroup` has now shipped; this is a `ScrollView` stacking them |
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
| ✅ | **Bin** | Shipped as a pure passthrough — a plain `View` already has no default visual styling, so unlike the web port there's no CSS reset to strip |
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
specifically are now near-trivial compositions of the shipped `StatusPage`
(Tier 4) — worth revisiting if a consuming app wants them as named
components rather than as two-line `StatusPage` usages.

## Tier 20 — Atomic & Molecular Gaps

### Atoms

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **LevelBar** | Shipped reusing `ProgressBar`'s exact `scaleX`-transform animation technique for the continuous fill; discrete mode's per-block color change is left unanimated (decorative nicety, not a gap) |
| ✅ | **Expander** | Shipped — single `Animated.View` with a directly-driven numeric `height` (`useNativeDriver: false`) replaces the web version's two-transition CSS grid trick, since the content `onLayout` measurement already folds in its own `paddingTop`; chevron is `PanEnd` rotating via the same `interpolate`-to-`rotate` recipe `Spinner` uses |
| ✅ | **PasswordField** | Shipped — `TextField` + the exact `secureTextEntry`/`IconButton` reveal recipe `PasswordEntryRow` already established, but at `size="sm"` (28 dp circular) matching the web version's own `size="sm"` on this component specifically (as opposed to `PasswordEntryRow`'s default size, sized for a taller row). The toggle is absolutely positioned at the input's trailing edge, vertically centered, with extra trailing padding on the input so typed text never runs under it — the RN port of the source CSS's `position: absolute` toggle + `.hasToggle` padding |
| ✅ | **Divider** | Shipped — two flex-1 line `View`s flanking an optional `Text variant="caption" color="dim"` label; unlike `Separator`'s `accessible={false}`, this one carries `role="separator"` + `accessibilityLabel` since a labelled divider ("OR") is meant to be read aloud |
| ⬜ | **RatingStars** | Directly portable — tap-to-select row of `Icon`s (`Star`/`StarOutline`), roving-tabindex keyboard nav drops per this package's standing convention |
| ✅ | **FileTypeIcon** | Shipped — `fileType.ts`'s pure MIME/extension → category resolver duplicated verbatim from `@gnome-ui/react`; thumbnail reuses `Avatar`'s `Image`/`resizeMode="cover"` recipe, sized from `Icon`'s own size map |
| ✅ | **Callout** | Shipped — `role="note"` ports 1:1 from RN's web-aligned `Role` union (same as `Dialog`/`Tooltip`); icon color reuses `Icon`'s fixed named palette (`blue`/`yellow`/`green`) instead of arbitrary hex — `blue3`/`green4` resolve to the exact same hex as `accentBgColor`/`successBgColor` in every theme this package ships, so `info`/`tip` are an exact match, not an approximation, and `yellow4` mirrors the source CSS's own `color-mix(warning 70%, black)` darkened-icon-for-contrast intent. Tinted backgrounds use the same `#RRGGBBAA`-alpha-suffix substitution `Chip`/`Blockquote` already established. Dismiss button reuses the existing `Close` icon rather than hand-drawing the web's inline SVG path |
| ⬜ | **StepIndicator** | Directly portable — row of derived dots/numbers from `currentStep`, no internal state |
| ✅ | **RangeSlider** | Shipped — dual-thumb version of `Slider`, reusing its `PanResponder`/`locationX` pixel-positioning technique verbatim. A single `PanResponder` spans the whole track rather than one per thumb: on `onPanResponderGrant` it picks whichever thumb is nearer the touch point (the web version's own nearest-thumb logic) and that thumb stays locked to the gesture through every `onPanResponderMove`, even if the touch drifts closer to the other thumb — this single-responder shape also covers the web's separate "click the track to jump" affordance for free. The web's keyboard (arrows/Page Up-Down/Home-End) has no port — replaced by two independent `accessibilityRole="adjustable"` elements (one per thumb), the same VoiceOver/TalkBack increment-decrement analog `Slider` already established, each thumb's own visual `View` staying `pointerEvents="none"` since dragging is the track responder's job, not a per-thumb touch target |
| ⬜ | **TextTruncate** | The one atom needing real design work — RN has `numberOfLines` but no "did this actually truncate" overflow signal the way `ResizeObserver` gives the web version; likely needs an `onTextLayout` line-count comparison trick, wrapped in the already-shipped `Tooltip` when truncation is detected |
| 🚫 | **Kbd** | No physical keyboard on mobile to reference — not planned, same reasoning as `ShortcutLabel`/`ShortcutsDialog` |
| ✅ | **Highlight** | Shipped — outer themed `Text` wraps matched runs in plain (unthemed) nested RN `Text`, relying on RN's ambient style inheritance for nested `Text` so a run only overrides `backgroundColor`/`fontWeight` instead of resetting to `variant="body"`; the web's `color-mix()` translucent background resolves to a literal 8-digit `#RRGGBBAA` hex |
| ⬜ | **VisuallyHidden** | This package already has the underlying recipe inline on every component that needs it (`accessibilityElementsHidden` + `importantForAccessibility="no"`, first established by `PathBar`) — extracting a reusable wrapper is a quick win, not new design |
| ✅ | **Overlay** | Extracted as a new standalone primitive (`Dialog`'s backdrop recipe + `BottomSheet`'s timed-exit-animation technique); not retrofitted into `Dialog`/`Dropdown`/`Popover`/`BottomSheet` themselves — each keeps its own already-shipped, already-tested inline copy |
| ✅ | **Box** | Shipped — added to this file retroactively via the 2026-09-06 word-boundary cross-check (see the Summary), then built the same day as the first component driven by a real consuming app ([`MyNpmLens`](https://github.com/ElJijuna/MyNpmLens) imports it 16 times, more than any other unported component). `BoxSpacing` ports verbatim rather than being remapped onto this package's own `theme.space1`–`space6` scale — the two overlap at 6/12/18/24/48 but not at 3 or 32/36, and it's a published type consumers may already import. `spacing`/`padding` narrow to numbers (RN's `gap`/`padding` take dp, not CSS strings), and `align`/`justify` keep the web's bare `start`/`end` keywords in the public API but map internally onto Yoga's `flex-start`/`flex-end`. `display: 'flex'` needs no port — every RN `View` is already a flex container |
| ✅ | **Blockquote** | Shipped — `View` with a colored left border, mirroring `Chip`'s `#RRGGBBAA`-alpha-suffix substitution for the web's `color-mix()` tinted backgrounds (8% for info/error/success, 14% for warning, matching the source CSS exactly); `default` variant uses `theme.borderSubtle` (already `rgba(...)`, so it's kept out of the shared hex+alpha lookup and given a plain `transparent` background instead of a broken string concat). `<blockquote>`/`<footer>`/`<cite>` have no RN role equivalent — dropped, same as `PathBar`'s `<nav>`/`HeaderBar`'s `<header>` |
| ✅ | **StatusBadge** | Shipped — simpler sibling of `Badge` (no anchor/dot mode, no counter), reusing its exact `getVariantColors` shape (a local copy, since `Badge`'s own helper isn't exported) plus a `new` (purple) variant `Badge` doesn't have. `neutral`'s background is `theme.hoverOverlay` — matching the source CSS's `--gnome-hover-overlay` exactly — rather than `Badge`'s own flat `light4`/`dark2` neutral, since this component's source CSS genuinely differs from `Badge`'s on that one variant. Not to be confused with `SeverityBadge` (still 🚫, domain-specific) |
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
| ⬜ | **TagInput** | Unblocked — both prerequisites (`WrapBox` + `Chip`, Tier 7) have now shipped |
| ⬜ | **OtpInput** | Directly portable — N `TextInput` cells, auto-advance via `onChangeText` + `ref.focus()`, no web-only APIs involved |
| ⬜ | **CopyField** | Blocked on `CopyButton`'s clipboard dependency (Tier 8) |
| ⬜ | **ChoiceCardGroup** | Directly portable — roving-selection group of `Card`s, same recipe `RadioButton` already established |
| ⬜ | **FileDropZone** | Needs reimagining, not a port — "drag and drop" has no touch equivalent; the mobile-idiomatic shape is a tap target opening `expo-document-picker`/`expo-image-picker`, a new peer dependency |
| ✅ | **MultiSelectDropdown** | Shipped — checkbox-list variant of `Dropdown`, reusing its `Modal` + backdrop + independently-measured-then-combined trigger-rect/panel-height positioning (`Rect`/`Position`/`computePosition`) verbatim rather than extracting a shared hook, the same duplication judgment call already applied to `Tooltip`/`Dropdown`'s own position code — though this is now the third near-identical copy of the up/down-flip-clamp-to-width shape specifically, worth extracting if a fourth caller needs it. Toggling an option keeps the panel open (unlike `Dropdown`'s `selectOption`, which closes it); each row gets a leading checkbox-square visual instead of `Dropdown`'s single trailing checkmark. Built as the documented prerequisite for `FilterableMultiSelectDropdown` (see "React-only originals" below), at the user's explicit choice when asked build-order (ship this first vs. build the filterable one standalone) |
| ⬜ | **CodeBlock** | Directly portable — monospace `Text` block + optional line numbers, `theme.fontFamilyMono` already exists |
| ⬜ | **WidgetManager** | Low priority — complex composite (catalog picker, staged add/remove); revisit only if a concrete dashboard/widget use case appears |
| ✅ | **Drawer** | Missing from this file's original pass, added retroactively (found the same way `SegmentedBar` was). Slide-in panel anchored left/right, floats with a margin on every side (all four corners rounded, mirroring the `@gnome-ui/react` source's own recent CSS update) via `justifyContent` on the backdrop rather than the web CSS's `margin: auto` — confirmed on-device with saturated debug colors, since RN auto-margin support was unverified for this Yoga version. No drag-to-dismiss (the web source has no exit keyframes either), so it follows `Dialog`'s simpler animation shape rather than `BottomSheet`'s. `DrawerDepthContext` (nested-drawer width auto-scaling) ports 1:1, pure React state. `rail` unblocked the new `IconButton` (see Tier 8) |
| ✅ | **FieldGroup** | Shipped — `<fieldset>`/`<legend>` have no RN element equivalent, so it's a plain `View` with `role="group"` (RN's `Role` union has it natively) and a themed `Text` label. Hint/error text reuses `TextField`'s exact recipe verbatim (`error ?? helperText`, `error ? errorColor : windowFgColor` + `error ? 1 : opacityDim`) rather than re-deriving the same logic. `disabled` only dims the group visually — RN has no equivalent of a native fieldset's automatic disabled-propagates-to-descendants behavior, so each child control still needs disabling individually, a real (documented) gap from the web version |
| 🚫 | **Portal** | No RN counterpart to extract — every floating component already owns its `Modal` internally (see the standing constraints at the top of this file) |
| ✅ | **CoachMark** | Shipped, with `CoachMarkTour` (pure state orchestration, ported verbatim). `coachMarkUtils.ts`'s two-pass viewport-flip math duplicated verbatim (pure, no DOM). The CSS `box-shadow: 0 0 0 100vmax` spotlight cutout has no RN port — rebuilt as four plain scrim `View` bands around the target rect plus a separate accent-ring `View`, all inside one full-screen `Pressable` so a tap anywhere (including "in the hole") triggers `dismissOnBackdrop`, matching the web version exactly. **Real bug found and fixed via the on-device screenshot check**: measuring the target with `measureInWindow` too early (even one `requestAnimationFrame` later) caught a stale rect when the target sat below sibling content whose size wasn't final on the first commit — fixed with a real `setTimeout` delay instead of rAF, confirmed by comparing the measured `y` against the target's real on-screen position in a plain (non-spotlighted) screenshot |
| ✅ | **AvatarGroup** | Shipped — overlapping stack of the already-shipped `Avatar`, plus a "+N" overflow chip reusing `Avatar`'s own per-size box dimensions. The web's two-layered `box-shadow` ring (inset hairline + outset window-colored ring) collapses to a single `borderWidth: 2` override, since RN gives a `View` only one border — kept the outer separating ring, since that's the one doing the actual distinguish-overlapping-avatars work |
| ✅ | **AvatarRotator** | Shipped — each image source is its own absolutely-positioned `Avatar` layer, crossfaded via a `RotatorLayer` sub-component that owns its own `Animated.Value` (the `Toast`/`Toaster` "each item animates itself" shape). Reduced motion stops the auto-advance timer outright, not just the fade, ported exactly from the web effect's own bail-out condition. `pauseOnHover` → `pauseOnPress` (`onPressIn`/`onPressOut`), the same touch substitution `Toast`'s press-and-hold pause established |
| ✅ | **ColorPicker** | Shipped with `ColorSwatch` and the `GNOME_PALETTE` export. The web's three `box-shadow` rings collapse into real box-model pieces (RN gives a `View` one border): the resting `inset 0 0 0 1px` hairline becomes `borderWidth: 1`, the selected `inset 0 0 0 2px white` becomes a 2 dp white border, and the outer `0 0 0 2px var(--swatch-color)` becomes a wrapper painted in the swatch color — **rendered unconditionally with the same padding**, because a box-shadow ring costs no layout space on the web while a real padded wrapper does, and reserving it is what stops the row reflowing as the selection moves. `filter: drop-shadow()` on the checkmark has no port, so the path is drawn twice (translucent black offset 1 dp, then white) — that's what the filter renders, and it's why it exists: without it the check vanishes on the yellow swatch. **`allowCustom` is the one prop that changes meaning**: on the web it wires a hidden `<input type="color">` and the browser supplies the picker, which RN has no equivalent for (an HSV picker is its own component, not a detail of this one), so the prop keeps its visible behaviour — the "+" button and an off-palette `value` shown as its own selected swatch — while the press is handed to a new `onRequestCustom` callback for the app to answer. Container is a `WrapBox`; `border: 1.5px dashed` ports directly, `borderStyle: 'dashed'` being one of the few CSS border tricks RN supports |
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

`FilterableMultiSelectDropdown` exists in `@gnome-ui/react` — it's an
original component invented for that package specifically (a
`MultiSelectDropdown` variant with a built-in search field), not a mirror
of any GNOME/libadwaita widget, so it stays outside the tier system by
design. **Shipped in this package (2026-09-11)**, once `MultiSelectDropdown`
(Tier 20, above) landed as its prerequisite — a parallel implementation
duplicating `MultiSelectDropdown`'s shape and positioning recipe rather
than wrapping it (matching how the web source itself relates to
`MultiSelectDropdown`: sharing only the `MultiSelectDropdownOption` type,
not composed from it), plus a filter `TextInput` pinned above the list,
auto-focused via `autoFocus` on open. The web version's filter-field
keyboard handler (↑/↓ roving highlight, Home/End, Enter-to-toggle) has no
RN port — same "no keyboard focus to drive it" reasoning `Dropdown`
already established — but the `TextInput` itself, and its software
keyboard, still works natively; only the roving-highlight navigation on
top of it is dropped.

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
  on each `Avatar`, since RN gives a `View` only one border — and
  `AvatarRotator` (Tier 20), whose `RotatorLayer` sub-component gives each
  crossfading image its own `Animated.Value` (the `Toast`/`Toaster`
  "each item animates itself" shape) and whose reduced-motion handling
  stops the auto-advance timer outright, not just the fade, matching the
  web effect's own bail-out condition exactly.
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
- **Next real gap**: the rest of Tier 6 — `Clamp` shipped (2026-09-06), the
  one member with no breakpoint dependency, so `useBreakpoint` is now the
  only thing standing between this package and every remaining adaptive
  item: `Sidebar` v2, `ViewSwitcherSidebar`, `BreakpointBin`, `Sidebar`'s
  own adaptive `mode`, `NavigationSplitView`, `OverlaySplitView`,
  `ViewSwitcherBar`.
- **Cheap, unblocked wins available right now** (no missing prerequisite):
  Tier 8's `Toolbar`/`Spacer`/
  `LinkedGroup`/`Frame`/`ExpanderRow`; all of Tier 12's row composites;
  Tier 14's remaining `NavigationView`/`Carousel`; most of Tier 20's
  remaining atoms, plus the `Popover`-unblocked molecule cluster
  (`DatePicker`/`TimePicker`/`FontPicker`/`EmojiPicker`/`CoachMark`, once
  `Calendar` exists for the first two).
- **Open follow-up (`ViewSwitcher`, found 2026-09-06 while building
  `ToggleGroup`)**: `ViewSwitcher`'s container sets `accessible` alongside
  `accessibilityRole="radiogroup"`. On iOS that collapses the whole subtree
  into a single accessibility element, which would leave its individual
  `ViewSwitcherItem`s unreachable to VoiceOver. `ToggleGroup` deliberately
  omits `accessible` for that reason. Not changed in `ViewSwitcher` as part
  of that turn — needs its own on-device VoiceOver check first.
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

# Roadmap — @gnome-ui/web-components

Component porting plan from `@gnome-ui/react` to framework-agnostic Custom
Elements. Same design constraints as the five shipped components:

- **Light DOM only** — no Shadow DOM, so htmx and server-rendered fragments
  keep working without `htmx.process()`.
- **Compose native semantics** — wrap a real `<button>`, `<input>`, `<a>`…
  instead of reimplementing behavior on the host element. The host adds
  ARIA relationships, keyboard handling, and state; it does not replace the
  control.
- **`data-slot` contract** — consumers mark light-DOM children with
  `data-slot="…"` so the host can find and wire them up.
- **`gnome-*` custom events** — `gnome-open-change`, `gnome-cancel`,
  `gnome-close`, `gnome-select`, etc. Cancelable where the interaction can be
  vetoed by the consumer.
- **Mutation-observed fragment replacement** — components observe their
  light-DOM subtree while active so htmx/Turbo swaps don't require
  re-registration.
- **Idempotent registration** + SSR-safe (`customElements` guarded) entry
  points, one per component, plus the barrel `@gnome-ui/web-components`.

Legend: ✅ Done · 🚧 In progress · ⬜ Pending

---

## Shipped (Foundation)

| Status | Element | Ported from |
|--------|---------|-------------|
| ✅ | `<gnome-button>` | `Button` |
| ✅ | `<gnome-dialog>` | `Dialog` / `AlertDialog` |
| ✅ | `<gnome-menu>` | `Dropdown` (menu semantics) |
| ✅ | `<gnome-toast>` | `Toast` |
| ✅ | `<gnome-popover>` | `Popover` |
| ✅ | `<gnome-switch>` | `Switch` |
| ✅ | `<gnome-checkbox>` | `Checkbox` |
| ✅ | `<gnome-radio-group>` | `RadioButton` |
| ✅ | `<gnome-text-field>` | `TextField` |
| ✅ | `<gnome-spin-button>` | `SpinButton` |
| ✅ | `<gnome-slider>` | `Slider` |
| ✅ | `<gnome-spinner>` | `Spinner` |
| ✅ | `<gnome-progress-bar>` | `ProgressBar` |
| ✅ | `<gnome-badge>` | `Badge` |
| ✅ | `<gnome-avatar>` | `Avatar` |
| ✅ | `<gnome-skeleton>` | `Skeleton` |
| ✅ | `<gnome-separator>` | `Separator` |
| ✅ | `<gnome-banner>` | `Banner` |
| ✅ | `<gnome-tooltip>` | `Tooltip` |
| ✅ | `<gnome-card>` | `Card` |
| ✅ | `<gnome-action-row>` | `ActionRow` |
| ✅ | `<gnome-boxed-list>` | `BoxedList` |
| ✅ | `<gnome-header-bar>` | `HeaderBar` |

---

## Tier 1 — Native Form Controls

> Highest reuse of native semantics (`<input>`), lowest implementation risk.
> Establishes the form-association pattern other rows/inputs will reuse.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 1 | ✅ | `<gnome-switch>` | `Switch` | Wraps `<input type="checkbox" role="switch">`; native `change`/`input` events bubble through the light-DOM host, no custom event needed |
| 2 | ✅ | `<gnome-checkbox>` | `Checkbox` | Wraps `<input type="checkbox">`; host applies `indeterminate` imperatively since it has no HTML attribute equivalent |
| 3 | ✅ | `<gnome-radio-group>` | `RadioButton` | Native same-name radios already provide exclusivity and arrow-key cycling; host adds shared/auto-generated `name`, group-level `disabled`, and a `value`/`gnome-change` API |
| 4 | ✅ | `<gnome-text-field>` | `TextField` | Wraps `<input>`/`<textarea>`; links label (`for`/`id`) and hint (`aria-describedby`); delegates `focus()`/`validity`/`checkValidity()` |
| 5 | ✅ | `<gnome-spin-button>` | `SpinButton` | Deliberately deviates from the React version (a synthetic `role="spinbutton"` widget) to wrap a real `<input type="number">`; step buttons call `stepDown()`/`stepUp()` and are `aria-hidden`/untabbable |
| 6 | ✅ | `<gnome-slider>` | `Slider` | Deliberately deviates from the React version (a synthetic `role="slider"` widget) to wrap a real `<input type="range">`; host only computes a `--gnome-slider-fill` custom property for the CSS track gradient |

---

## Tier 2 — Feedback & Status (no interaction)

> Presentational, no focus management required — fast to port, good filler
> between larger tiers.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 7 | ✅ | `<gnome-spinner>` | `Spinner` | `role="status"`, respects `prefers-reduced-motion`; no light-DOM children, no interaction |
| 8 | ✅ | `<gnome-progress-bar>` | `ProgressBar` | Native `<progress>` can't reliably paint a custom indeterminate pulse cross-browser, so — like `gnome-spinner` — host manages `role="progressbar"`/`aria-value*` itself and paints fill via a `--gnome-progress-value` custom property |
| 9 | ✅ | `<gnome-badge>` | `Badge` | Pure CSS host — `variant`/`dot`/`anchored` are plain attributes read directly by CSS; `anchored` requires the consumer's own wrapper to be `position: relative` |
| 10 | ✅ | `<gnome-avatar>` | `Avatar` | Composes a real `<img>`; its own `error`/`load` events drive the fallback. Initials are always derived, so — uniquely in this package — the host manages a `[data-slot="avatar-initials"]` element itself (adopting one already present, e.g. from SSR) |
| 11 | ✅ | `<gnome-skeleton>` | `Skeleton` | The `text` variant's rows are entirely host-derived from `lines` — like `gnome-avatar`'s initials, there is nothing for a consumer to author — but unlike `gnome-avatar` no `MutationObserver` is needed, since nothing external ever swaps this host-owned content |
| 12 | ✅ | `<gnome-separator>` | `Separator` | React renders `<hr>` (horizontal) or a `<div role="separator">` (vertical); since a custom element is one fixed tag, the host manages `role="separator"`/`aria-orientation` itself for both orientations |

---

## Tier 3 — Dismissible Feedback

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 13 | ✅ | `<gnome-banner>` | `Banner` | `variant` is a plain attribute read by CSS (no JS sync needed), same as `gnome-badge`/`gnome-toast`. `data-action`/`data-dismiss` descendants mirror `gnome-toast`'s click-delegation, but unlike toast an action click never auto-dismisses — a banner persists until its underlying condition is resolved |
| 14 | ✅ | `<gnome-tooltip>` | `Tooltip` | Reuses `computeFloatingPosition` from `internal/floating.ts`, same as `gnome-popover`. Content is never `hidden` — it stays laid out with `opacity: 0` so the fade/scale transition can animate (impossible from `display: none`), which as a side effect keeps `aria-describedby` content in the accessibility tree at all times, unlike the React version's `visibility: hidden` fallback |

---

## Tier 4 — Layout & Containers

> Mostly structural; validates the `data-slot` pattern for compound
> components with multiple named regions (title, subtitle, end-widget).

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 15 | ✅ | `<gnome-card>` | `Card` | React renders `<button>` (or whatever `as` specifies) when `interactive`; since a custom element is one fixed tag, the host composes a real `<button data-slot="card-surface">` around its existing children instead — moving them, not cloning, so listeners survive. Adopts a consumer-authored surface (e.g. an `<a>`) instead of generating one; unwraps back onto the host when `interactive` is removed |
| 16 | ✅ | `<gnome-action-row>` | `ActionRow` | `data-slot="row-title/row-subtitle/row-prefix/row-suffix"`, plus a generated/adopted `row-content` wrapper. Unlike React (which wraps *everything* including `trailing` in `<button>`), the generated `data-slot="row-surface"` button wraps only prefix+content — `row-suffix` stays outside it so a trailing `Switch`/`Button` never double-nests inside another interactive element. `gnome-activate` fires only from the surface, so suffix clicks are excluded without manual `stopPropagation()` |
| 17 | ✅ | `<gnome-boxed-list>` | `BoxedList` | Host sets `role="list"` and gives each direct child `role="listitem"` (re-applied to later-added children via a `childList` `MutationObserver`, since ARIA roles aren't CSS-expressible). Unlike React's inserted `<Separator>` elements, dividers are a pure CSS `border-top` on every child but the first — no JS bookkeeping as rows are added/removed. `variant="separate"` is a plain attribute read by CSS |
| 18 | ✅ | `<gnome-header-bar>` | `HeaderBar` | `data-slot="header-start/header-title/header-end"` placed in explicit CSS grid columns (not DOM-order) so the title stays centered without either side slot — no placeholder elements needed. Host gives `header-title` `aria-live="polite"`, re-applied via a `childList` `MutationObserver` if the title element is swapped |

---

## Tier 5 — Navigation

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 19 | ✅ | `<gnome-tab-bar>` | `Tabs` | `role="tablist"`; arrow-key navigation mirrors `gnome-menu`'s typeahead code path |
| 20 | ✅ | `<gnome-view-switcher>` | `ViewSwitcher` | Segmented control; pairs with `gnome-tab-bar` selection model |
| 21 | ⬜ | `<gnome-search-bar>` | `SearchBar` | Collapsible; reuses `gnome-popover` positioning for autocomplete list |

---

## Tier 6 — Advanced Controls

> Depends on Tier 1 groundwork (form-associated custom elements) and the
> `gnome-menu` selection model.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 22 | ✅ | `<gnome-dropdown>` | `Dropdown` | Combines `gnome-menu` internals with a trigger styled as a select |
| 23 | ✅ | `<gnome-combo-row>` | `ComboRow` | `gnome-action-row` + `gnome-dropdown` composition |
| 24 | ✅ | `<gnome-switch-row>` | `SwitchRow` | `gnome-action-row` + `gnome-switch` composition |
| 25 | ✅ | `<gnome-expander-row>` | `ExpanderRow` | Collapsible `gnome-action-row`; `prefers-reduced-motion` handling ported from React version |

---

## Tier 7 — Presentational Primitives

> Trivial complexity, no blocking dependencies — mostly derived-render or wraps a real
> native element directly. `IconButton` ships first since Tier 9 depends on it.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 26 | ✅ | `<gnome-icon-button>` | `IconButton` | Wraps `<button>`; icon-only shape of `gnome-button`. Hard blocker for Tier 9 |
| 27 | ✅ | `<gnome-level-bar>` | `LevelBar` | `role="meter"`; continuous fill or discrete block array, purely attribute-reactive |
| 28 | ✅ | `<gnome-divider>` | `Divider` | Distinct from `gnome-separator` — adds an optional centered label; `gnome-separator` only has `orientation`, no label support |
| 29 | ✅ | `<gnome-callout>` | `Callout` | `role="note"`; icon + message + optional dismiss button, visibility owned by the consumer |
| 30 | ✅ | `<gnome-highlight>` | `Highlight` | Pure string-split-and-`<mark>` rendering, stateless |
| 31 | ✅ | `<gnome-kbd>` | `Kbd` | Wraps native `<kbd>` directly; static symbol-lookup table |
| 32 | ✅ | `<gnome-file-type-icon>` | `FileTypeIcon` | Wraps `<img>` (thumbnail) or an icon glyph; MIME/filename category resolution ported alongside |
| 33 | ✅ | `<gnome-step-indicator>` | `StepIndicator` | `<nav>`/`<ol>` of step circles, fully derived from `currentStep`, no internal state |
| 34 | ✅ | `<gnome-field-group>` | `FieldGroup` | Wraps native `<fieldset>`/`<legend>` directly — free native `disabled`-cascade to all descendants |

---

## Tier 8 — Disclosure & Self-Contained Interaction

> Moderate complexity but no blocking dependencies — self-contained state machines that
> reuse patterns already proven by shipped elements.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 35 | ✅ | `<gnome-expander>` | `Expander` | Disclosure trigger `<button>` + `role="region"` content, same shape as `gnome-dialog`'s toggle logic |
| 36 | ✅ | `<gnome-otp-input>` | `OtpInput` | N native `<input>` cells in a `<fieldset>`; auto-advance, backspace-to-previous, paste-distributes |
| 37 | ⬜ | `<gnome-file-drop-zone>` | `FileDropZone` | Native `DragEvent`s + hidden `<input type="file">`; drag-enter/leave counter for nested-element correctness |
| 38 | ✅ | `<gnome-rating-stars>` | `RatingStars` | Roving-tabindex `role="radiogroup"`, same recipe as `gnome-radio-group`; read-only mode uses `role="img"` |
| 39 | ✅ | `<gnome-choice-card-group>` | `ChoiceCardGroup` | Roving-tabindex `radiogroup` of cards, same recipe as `gnome-radio-group` |
| 40 | ✅ | `<gnome-text-truncate>` | `TextTruncate` | `ResizeObserver`-driven overflow detection, wraps content in already-shipped `gnome-tooltip` when truncated |

---

## Tier 9 — IconButton-Dependent Composites

> Blocked on Tier 7's `<gnome-icon-button>`.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 41 | ✅ | `<gnome-copy-button>` | `CopyButton` | `IconButton` + `navigator.clipboard`; timeout-reset "copied" state, `aria-live` confirmation |
| 42 | ⬜ | `<gnome-password-field>` | `PasswordField` | Near-identical shape to shipped `gnome-text-field`, plus a reveal `IconButton` toggling `type` |
| 43 | ⬜ | `<gnome-copy-field>` | `CopyField` | `<input readonly>` + trailing `gnome-copy-button`; no own state |
| 44 | ⬜ | `<gnome-code-block>` | `CodeBlock` | `<pre><code>` + header (filename/language/`gnome-copy-button`); no syntax highlighting |
| 45 | ⬜ | `<gnome-emoji-picker>` | `EmojiPicker` | Composes already-shipped `gnome-popover` + `gnome-icon-button`; search-filter, session-only "recently used", static `emojiData.ts` dataset |

---

## Tier 10 — Dropdown / Listbox Cluster

> Shares flip-positioning and listbox-keyboard-nav logic — port as one cluster rather than
> in isolation to avoid duplicating the same pattern three times.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 46 | ⬜ | `<gnome-dropdown>` | `Dropdown` | Shared foundation for this cluster (see also old Tier 6 priority 22 — combines `gnome-menu` internals with a select-styled trigger) |
| 47 | ⬜ | `<gnome-multi-select-dropdown>` | `MultiSelectDropdown` | `role="combobox"` trigger + `role="listbox"` of checkbox options; flip-up/down positioning via `getBoundingClientRect`, outside-click-to-close |
| 48 | ⬜ | `<gnome-font-picker>` | `FontPicker` | Trivial glue code (one `open` boolean) over `gnome-popover` + two `gnome-dropdown`s + `gnome-spin-button`; blocked on `gnome-dropdown` |

---

## Tier 11 — Heavy Interaction / Needs Own Design Pass

> Same complexity class as the hardest already-shipped elements, or blocked on untriaged
> prerequisites — sequence last.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 49 | ⬜ | `<gnome-range-slider>` | `RangeSlider` | Dual-thumb `PointerEvent` drag (no native dual-handle `<input type="range">`); same complexity class as shipped `gnome-slider`, which already proves pointer-capture works in light DOM |
| 50 | ⬜ | `<gnome-overlay>` | `Overlay` | Backdrop/scrim + fade-timing state machine + scroll lock; reuse `gnome-dialog`/`gnome-popover`'s internals rather than reimplement |
| 51 | ⬜ | `<gnome-chip>` | `Chip` | Untriaged — needs its own read before estimating. Prerequisite for `gnome-tag-input` |
| 52 | ⬜ | `<gnome-wrap-box>` | `WrapBox` | Untriaged — likely a trivial flex-wrap container. Prerequisite for `gnome-tag-input` |
| 53 | ⬜ | `<gnome-tag-input>` | `TagInput` | `<input>` + chip-list container; draft-text/Enter-to-commit/backspace-to-remove state. Blocked on `gnome-chip` + `gnome-wrap-box` |

---

## Deferred / Not Planned

> Components better served staying React-only for now: heavy composition
> surface, low demand outside a React app shell, or dependent on React
> context (`GnomeProvider` locale/theme) that has no light-DOM equivalent
> yet.

| Component | Reason |
|-----------|--------|
| `NavigationSplitView`, `OverlaySplitView`, `NavigationView` | Full page-shell layout primitives; revisit alongside `@gnome-ui/layout` parity, not before Tier 6 |
| `PreferencesDialog` / `PreferencesPage` / `PreferencesGroup` | Composite of many not-yet-ported rows; wait until Tier 6 lands |
| `Carousel`, `BottomSheet` | Gesture-heavy; needs a pointer/swipe internal helper first |
| `ColumnView` | Large surface area (sorting, virtualization); needs its own design pass |
| `ContributionGraph`, chart components | SVG data-viz, framework-agnostic port has little value over embedding the React version |
| `Portal` | React-specific plumbing; light-DOM custom elements already render in the real DOM tree, no portal abstraction needed — `gnome-dialog`/`gnome-popover` handle their own positioning internally |
| `VisuallyHidden` | Cross-cutting CSS utility, not a component with behavior; ship as a `.gnome-sr-only` utility class in `styles.css` instead of a custom element |

---

## Working Agreement

- One component per PR/commit, `feat(@gnome-ui/web-components): add <name> element`.
- Each ships with: `<name>.ts`, `<name>.test.ts` (Vitest/jsdom), `<name>.stories.ts`
  (Storybook), and a Playwright case in `e2e/` for keyboard/focus behavior.
- Update `src/index.ts` barrel, `package.json` `exports` map, and the
  README's component list + events table in the same change.
- Tell me which numbered item to do next; I'll pick up from wherever this
  list points.

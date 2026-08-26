# gnome-ui

A React component library that faithfully implements the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), built on top of the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/gnome--ui-docs-3584e4)](https://gnome-ui.org/)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://gnome-ui.org/react/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ElJijuna/gnome-ui/blob/main/LICENSE)

Read the guides, architecture, design guidelines, roadmap, and changelog at
**[gnome-ui.org](https://gnome-ui.org/)** — and
browse every component live, with real interactive previews, in each
package's own Storybook (linked throughout, and per-row in the tables
below).

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@gnome-ui/core`](https://github.com/ElJijuna/gnome-ui/tree/main/packages/core) | Framework-agnostic design tokens (CSS custom properties) | [![npm](https://img.shields.io/npm/v/@gnome-ui/core)](https://www.npmjs.com/package/@gnome-ui/core) |
| [`@gnome-ui/icons`](https://github.com/ElJijuna/gnome-ui/tree/main/packages/icons) | Framework-agnostic Adwaita symbolic icon definitions (SVG path data) | [![npm](https://img.shields.io/npm/v/@gnome-ui/icons)](https://www.npmjs.com/package/@gnome-ui/icons) |
| [`@gnome-ui/react`](https://github.com/ElJijuna/gnome-ui/tree/main/packages/react) | React component library | [![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react) |
| [`@gnome-ui/layout`](https://github.com/ElJijuna/gnome-ui/tree/main/packages/layout) | Full-page application shell and dashboard components | [![npm](https://img.shields.io/npm/v/@gnome-ui/layout)](https://www.npmjs.com/package/@gnome-ui/layout) |
| [`@gnome-ui/platform`](https://github.com/ElJijuna/gnome-ui/tree/main/packages/platform) | TypeScript bridge to GNOME host APIs (GSettings, portals, notifications…) | [![npm](https://img.shields.io/npm/v/@gnome-ui/platform)](https://www.npmjs.com/package/@gnome-ui/platform) |
| [`@gnome-ui/hooks`](https://github.com/ElJijuna/gnome-ui/tree/main/packages/hooks) | React hooks that surface `@gnome-ui/platform` APIs as idiomatic React state | [![npm](https://img.shields.io/npm/v/@gnome-ui/hooks)](https://www.npmjs.com/package/@gnome-ui/hooks) |
| [`@gnome-ui/charts`](https://github.com/ElJijuna/gnome-ui/tree/main/packages/charts) | Data visualisation components (Line, Bar, Area) styled with Adwaita tokens | [![npm](https://img.shields.io/npm/v/@gnome-ui/charts)](https://www.npmjs.com/package/@gnome-ui/charts) |
| [`@gnome-ui/react-native`](https://github.com/ElJijuna/gnome-ui/tree/main/packages/react-native) | React Native components for iOS/Android/GNOME-mobile | [![npm](https://img.shields.io/npm/v/@gnome-ui/react-native)](https://www.npmjs.com/package/@gnome-ui/react-native) |

## Quick start

```bash
npm install @gnome-ui/react
```

```tsx
import { Button } from "@gnome-ui/react";
import "@gnome-ui/react/styles";

export default function App() {
  return (
    <Button variant="suggested" onClick={() => console.log("clicked")}>
      Save Changes
    </Button>
  );
}
```

### Locale & number formatting

Wrap your app in `GnomeProvider` to share locale, text direction, and default `Intl` options across `@gnome-ui/react`, `@gnome-ui/layout`, and `@gnome-ui/charts`.

```tsx
import { GnomeProvider } from "@gnome-ui/react";

<GnomeProvider
  locale="en-US"
  numberFormat={{ notation: "compact", compactDisplay: "short" }}
>
  <App />
</GnomeProvider>
```

Compact notation renders values like `1K`; standard notation renders values like `1,000`.

> **Tokens only** (framework-agnostic):
> ```bash
> npm install @gnome-ui/core
> ```
> ```css
> @import "@gnome-ui/core/styles";
> ```

## Components

Live examples and documentation: **[Storybook →](https://gnome-ui.org/react/)**

AI assistants and coding agents can use [`llms.txt`](https://gnome-ui.org/llms.txt)
for a compact documentation index or
[`llms-full.txt`](https://gnome-ui.org/llms-full.txt) for complete context.

<!-- component-table:react -->
| Component | Description | Story |
|-----------|-------------|-------|
| `AboutDialog` | Standard app info dialog with details, credits, and legal tabs. Mirrors `AdwAboutDialog`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-aboutdialog--docs) |
| `ActionRow` | Standard settings row with title, optional subtitle, leading icon, and trailing widget. | [Docs](https://gnome-ui.org/react/?path=/docs/components-actionrow--docs) |
| `AffectedPackage` |  | [Docs](https://gnome-ui.org/react/) |
| `AnimatedIcon` | Plays the CSS animation embedded in an `animated` icon from [`@gnome-ui/icons`](https://www.npmjs.com/package/@gnome-ui/icons) — `Syncing`, `Recording`, `Downloading`, `Connecting`. Rendered through plain `Icon` instead, these show a static frame; `AnimatedIcon` is what turns the animation on. | [Docs](https://gnome-ui.org/react/?path=/docs/components-animatedicon--docs) |
| `Avatar` | Circular avatar following the Adwaita `AdwAvatar` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-avatar--docs) |
| `AvatarGroup` | Stack of avatars with overflow indicator. | [Docs](https://gnome-ui.org/react/?path=/docs/components-avatargroup--docs) |
| `AvatarRotator` | Single avatar surface that crossfades through multiple image sources. | [Docs](https://gnome-ui.org/react/?path=/docs/components-avatarrotator--docs) |
| `Badge` | Counter or status indicator, optionally overlaid on another element. | [Docs](https://gnome-ui.org/react/?path=/docs/components-badge--docs) |
| `Banner` | Persistent message strip displayed at the top of a view. | [Docs](https://gnome-ui.org/react/?path=/docs/components-banner--docs) |
| `Bin` | Single-child container with no visual styling. | [Docs](https://gnome-ui.org/react/?path=/docs/components-bin--docs) |
| `Blockquote` | Styled pull-quote with semantic `<blockquote>` markup. | [Docs](https://gnome-ui.org/react/?path=/docs/components-blockquote--docs) |
| `BottomSheet` | Slide-up panel that overlays content from the bottom edge. | [Docs](https://gnome-ui.org/react/?path=/docs/components-bottomsheet--docs) |
| `BoxedList` | Rounded bordered list — the most common container pattern in GNOME settings and detail views. | [Docs](https://gnome-ui.org/react/?path=/docs/components-boxedlist--docs) |
| `BreakpointBin` | Container that fires layout changes when **its own width** crosses defined thresholds — the CSS container-query equivalent of `AdwBreakpointBin` (libadwaita 1.9 / GNOME 50). | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-breakpointbin--docs) |
| `Button` | Button component following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/patterns/controls/buttons.html). | [Docs](https://gnome-ui.org/react/?path=/docs/components-button--docs) |
| `ButtonContent` | Icon + label layout helper for buttons that contain both an icon and text. | [Docs](https://gnome-ui.org/react/?path=/docs/components-buttoncontent--docs) |
| `ButtonRow` | Full-width activatable row styled as a button inside a `BoxedList`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-buttonrow--docs) |
| `Calendar` | Month-grid date display with full keyboard navigation — mirrors [`GtkCalendar`](https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html). Usable standalone (settings, forms) or as the panel inside a `DatePicker`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-calendar--docs) |
| `CalendarRange` | Start/end date-range selection driving the same grid engine as `Calendar` — roving `tabindex`, month/year drill-down, `min`/`max`, week numbers, localisation. | [Docs](https://gnome-ui.org/react/?path=/docs/components-calendarrange--docs) |
| `Callout` | Inline, dismissible admonition box for contextual help text within forms and cards. | [Docs](https://gnome-ui.org/react/?path=/docs/components-callout--docs) |
| `Card` | Card component following the [GNOME HIG containers](https://developer.gnome.org/hig/patterns/containers.html) and the Adwaita `.card` style class. | [Docs](https://gnome-ui.org/react/?path=/docs/components-card--docs) |
| `Carousel` | Swipeable content carousel. | [Docs](https://gnome-ui.org/react/?path=/docs/components-carousel--docs) |
| `Checkbox` | Checkbox for multi-selection, following the GNOME HIG and Adwaita style. | [Docs](https://gnome-ui.org/react/?path=/docs/components-checkbox--docs) |
| `CheckRow` | Activatable row with an integrated checkbox. | [Docs](https://gnome-ui.org/react/?path=/docs/components-checkrow--docs) |
| `Chip` | Compact pill-shaped label for tags, filters, and selection states. | [Docs](https://gnome-ui.org/react/?path=/docs/components-chip--docs) |
| `ChoiceCardGroup` | Card-based single-choice selector — large selectable cards instead of radio buttons. | [Docs](https://gnome-ui.org/react/?path=/docs/components-choicecardgroup--docs) |
| `Clamp` | Constrains its child to a maximum width while allowing it to shrink freely on narrow screens — mirroring the Adwaita `AdwClamp` widget. | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-clamp--docs) |
| `CoachMark` | Onboarding **feature-discovery** pattern: spotlight a UI element and anchor a callout bubble (title, description, actions) beside it to teach a user one feature. Compose several with `CoachMarkTour`, or drive a single mark with `open`. | [Docs](https://gnome-ui.org/react/) |
| `CodeBlock` | Static monospace code/config snippet display with optional line numbers and a trailing `CopyButton`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-codeblock--docs) |
| `ColorPicker` | Color palette picker following the Adwaita `GtkColorButton` + swatch pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-colorpicker--docs) |
| `ColumnView` | Multi-column sortable data table styled with Adwaita design tokens. | [Docs](https://gnome-ui.org/react/?path=/docs/data-display-columnview--docs) |
| `ComboRow` | Settings row with an inline combo selector at the trailing edge. | [Docs](https://gnome-ui.org/react/?path=/docs/components-comborow--docs) |
| `ContributionGraph` | A responsive activity heatmap calendar styled with Adwaita design tokens. Colour intensity represents activity count per day. | [Docs](https://gnome-ui.org/react/?path=/docs/data-display-contributiongraph--docs) |
| `CopyButton` | Icon button that copies a value to the clipboard, swapping to a checkmark and a "Copied!" tooltip as confirmation. | [Docs](https://gnome-ui.org/react/?path=/docs/components-copybutton--docs) |
| `CopyField` | Read-only `TextField` with a built-in trailing `CopyButton`, for displaying copyable values (API keys, tokens, IDs) outside the `CveIdentifier`/`CweIdentifier`-style specialised components. | [Docs](https://gnome-ui.org/react/?path=/docs/components-copyfield--docs) |
| `CountDownTimer` | Displays a countdown timer showing the remaining time until a specified end date. | [Docs](https://gnome-ui.org/react/?path=/docs/components-countdowntimer--docs) |
| `CveIdentifier` | Monospace CVE identifier for vulnerability tables, findings, and report references. | [Docs](https://gnome-ui.org/react/?path=/docs/components-cveidentifier--docs) |
| `CvssScore` | Compact CVSS score display for vulnerability tables, finding summaries, and CVE detail surfaces. | [Docs](https://gnome-ui.org/react/?path=/docs/components-cvssscore--docs) |
| `CvssVector` |  | [Docs](https://gnome-ui.org/react/) |
| `CweIdentifier` |  | [Docs](https://gnome-ui.org/react/) |
| `DatePicker` | A [`Popover`](../Popover)-anchored [`Calendar`](../Calendar) behind an entry-styled trigger — mirrors the `GtkCalendar` + `GtkPopover` composition GNOME apps use for date entry. | [Docs](https://gnome-ui.org/react/?path=/docs/components-datepicker--docs) |
| `Dialog` | Blocking modal dialog — two modes in one component. | [Docs](https://gnome-ui.org/react/?path=/docs/components-dialog--docs) |
| `Divider` | Horizontal rule with an optional centred label — common auth/login-form pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-divider--docs) |
| `Drawer` | Slide-over panel for supplementary React content. Use `side` to open from the left or right, `size` for classic or wide widths, and pass the body through `children` or the `content` prop. | [Docs](https://gnome-ui.org/react/?path=/docs/components-drawer--docs) |
| `Dropdown` | Expandable option list following the Adwaita combo-row / drop-down style. | [Docs](https://gnome-ui.org/react/?path=/docs/components-dropdown--docs) |
| `EmojiPicker` | Searchable emoji grid in a `Popover`. Mirrors `GtkEmojiChooser`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-emojipicker--docs) |
| `EntryRow` | Row with an inline text entry field. | [Docs](https://gnome-ui.org/react/?path=/docs/components-entryrow--docs) |
| `Expander` | Standalone disclosure triangle + collapsible content — mirrors `GtkExpander`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-expander--docs) |
| `ExpanderRow` | Collapsible `ActionRow` that reveals nested rows on activation. | [Docs](https://gnome-ui.org/react/?path=/docs/components-expanderrow--docs) |
| `FieldGroup` | Generic form-field grouping with a shared label, help text, and error message, for arbitrary fields outside a `BoxedList`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-fieldgroup--docs) |
| `FileDropZone` | Drag-and-drop file upload target with hover/active states, falling back to a `GtkFileDialog`-style click-to-browse trigger. | [Docs](https://gnome-ui.org/react/?path=/docs/components-filedropzone--docs) |
| `FileTypeIcon` | Small icon — optionally a thumbnail — resolved from a file's MIME type or name extension. Useful for file-manager-style listings. | [Docs](https://gnome-ui.org/react/?path=/docs/components-filetypeicon--docs) |
| `FilterableMultiSelectDropdown` | `MultiSelectDropdown` plus a filter field for narrowing long option lists. | [Docs](https://gnome-ui.org/react/?path=/docs/components-filterablemultiselectdropdown--docs) |
| `FontPicker` | Button that opens a family/size/weight chooser. Mirrors `GtkFontDialogButton`: the trigger itself previews the current selection rendered in that font. | [Docs](https://gnome-ui.org/react/?path=/docs/components-fontpicker--docs) |
| `Footer` | Bottom bar with leading/trailing slots and optional center content. | [Docs](https://gnome-ui.org/react/?path=/docs/components-footer--docs) |
| `Frame` | Simple bordered surface with `border-radius` but no background fill. | [Docs](https://gnome-ui.org/react/?path=/docs/components-frame--docs) |
| `HeaderBar` | Title bar with centered title and leading/trailing action slots. | [Docs](https://gnome-ui.org/react/?path=/docs/components-headerbar--docs) |
| `Highlight` | Wraps every occurrence of `query` within `text` in a `<mark>` element. | [Docs](https://gnome-ui.org/react/?path=/docs/components-highlight--docs) |
| `Icon` | Renders an [`@gnome-ui/icons`](https://www.npmjs.com/package/@gnome-ui/icons) definition as an inline SVG. | [Docs](https://gnome-ui.org/react/?path=/docs/components-icon--docs) |
| `IconButton` | Icon-only action button composed from `Button`, `Icon`, and optionally `Tooltip`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-iconbutton--docs) |
| `InlineViewSwitcher` | Compact inline view switcher for placing inside content areas, cards, or toolbars. | [Docs](https://gnome-ui.org/react/?path=/docs/components-inlineviewswitcher--docs) |
| `Kbd` | Standalone single key-cap for inline instructional text. | [Docs](https://gnome-ui.org/react/?path=/docs/components-kbd--docs) |
| `LevelBar` | Discrete level indicator with colour-coded low/high offset zones — mirrors `GtkLevelBar`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-levelbar--docs) |
| `Link` | Inline hyperlink following GNOME HIG. | [Docs](https://gnome-ui.org/react/?path=/docs/components-link--docs) |
| `LinkedGroup` | Renders children as a single visually-connected unit with no gap and merged borders. | [Docs](https://gnome-ui.org/react/?path=/docs/components-linkedgroup--docs) |
| `Modal` |  | [Docs](https://gnome-ui.org/react/?path=/docs/components-modal--docs) |
| `MultiSelectDropdown` | Checkbox-list variant of `Dropdown` for selecting multiple values from a single trigger. | [Docs](https://gnome-ui.org/react/?path=/docs/components-multiselectdropdown--docs) |
| `NavigationSplitView` | Two-pane sidebar + content layout that collapses to a single navigable pane on narrow screens (≤ 400 px), mirroring `AdwNavigationSplitView`. | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-navigationsplitview--docs) |
| `NavigationView` | Single-pane push/pop navigation stack. | [Docs](https://gnome-ui.org/react/?path=/docs/components-navigationview--docs) |
| `OtpInput` | Segmented PIN/verification-code input — one cell per digit, with auto-advance on typing, backspace-to-previous-cell, and paste support. | [Docs](https://gnome-ui.org/react/?path=/docs/components-otpinput--docs) |
| `Overlay` | Standalone backdrop/scrim layer with a fade transition and click-to-dismiss — the shared building block behind `Modal`, `Dialog`, and `BottomSheet`'s backdrops, extracted for building custom overlay UI. | [Docs](https://gnome-ui.org/react/?path=/docs/components-overlay--docs) |
| `OverlaySplitView` | Sidebar + content layout where the sidebar becomes a slide-over **overlay** on narrow screens (≤ 400 px), mirroring `AdwOverlaySplitView`. | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-overlaysplitview--docs) |
| `PasswordEntryRow` | Password entry row with a built-in reveal/conceal toggle. | [Docs](https://gnome-ui.org/react/?path=/docs/components-passwordentryrow--docs) |
| `PasswordField` | Single-line password input with a peek toggle that reveals the value as plain text. | [Docs](https://gnome-ui.org/react/?path=/docs/components-passwordfield--docs) |
| `PathBar` | Breadcrumb path bar for navigating a hierarchical location. | [Docs](https://gnome-ui.org/react/?path=/docs/components-pathbar--docs) |
| `Popover` | Floating panel anchored to a trigger element, following the Adwaita `GtkPopover` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-popover--docs) |
| `Portal` | Reusable `createPortal` wrapper — SSR-safe (renders `children` inline when `document` is unavailable) with optional mount-target support. | [Docs](https://gnome-ui.org/react/?path=/docs/components-portal--docs) |
| `PreferencesDialog` | Multi-page settings dialog using `PreferencesPage` tabs. | [Docs](https://gnome-ui.org/react/?path=/docs/components-preferencesdialog--docs) |
| `PreferencesGroup` | Titled section that wraps a `BoxedList` with an optional description. | [Docs](https://gnome-ui.org/react/?path=/docs/components-preferencesgroup--docs) |
| `PreferencesPage` | Scrollable page composed of `PreferencesGroup` sections. | [Docs](https://gnome-ui.org/react/?path=/docs/components-preferencespage--docs) |
| `ProgressBar` | Determinate and indeterminate progress bar following the Adwaita style. | [Docs](https://gnome-ui.org/react/?path=/docs/components-progressbar--docs) |
| `RadioButton` | Single-selection radio button following the GNOME HIG and Adwaita style. | [Docs](https://gnome-ui.org/react/?path=/docs/components-radiobutton--docs) |
| `RangeSlider` | Dual-thumb slider for selecting a min/max range, following the Adwaita `GtkScale` pattern used by `Slider`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-rangeslider--docs) |
| `RatingStars` | Star rating display and input. | [Docs](https://gnome-ui.org/react/?path=/docs/components-ratingstars--docs) |
| `ScrollToTop` | Fixed-position button that scrolls the page to the top on click, following the GNOME Human Interface Guidelines. | [Docs](https://gnome-ui.org/react/?path=/docs/components-scrolltotop--docs) |
| `SearchBar` | Collapsible search bar following the Adwaita `AdwSearchBar` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-searchbar--docs) |
| `SecurityMetric` |  | [Docs](https://gnome-ui.org/react/?path=/docs/components-securitymetric--docs) |
| `SegmentedBar` | Horizontal bar split into proportional segments, one per category. | [Docs](https://gnome-ui.org/react/?path=/docs/components-segmentedbar--docs) |
| `Separator` | Thin dividing line that separates groups of content. | [Docs](https://gnome-ui.org/react/?path=/docs/components-separator--docs) |
| `SeverityBadge` | Pill-shaped label for vulnerability severities in security reports, CVE tables, dashboards, and scanner results. | [Docs](https://gnome-ui.org/react/?path=/docs/components-severitybadge--docs) |
| `ShortcutLabel` | Read-only display of a keyboard shortcut with per-key key-cap styling. | [Docs](https://gnome-ui.org/react/?path=/docs/components-shortcutlabel--docs) |
| `ShortcutsDialog` | Modal dialog listing keyboard shortcuts grouped in sections, with integrated search. | [Docs](https://gnome-ui.org/react/?path=/docs/components-shortcutsdialog--docs) |
| `Sidebar` | Lateral navigation panel following the Adwaita `.navigation-sidebar` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-sidebar--docs) |
| `Skeleton` | Content-shaped loading placeholder for skeleton screens. | [Docs](https://gnome-ui.org/react/?path=/docs/components-skeleton--docs) |
| `Slider` | Draggable range control following the Adwaita `GtkScale` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-slider--docs) |
| `SpinButton` | Numeric input with − and + buttons following the Adwaita `GtkSpinButton` style. | [Docs](https://gnome-ui.org/react/?path=/docs/components-spinbutton--docs) |
| `Spinner` | Indeterminate loading indicator following the Adwaita spinner style. | [Docs](https://gnome-ui.org/react/?path=/docs/components-spinner--docs) |
| `SpinRow` | Settings row with an integrated spin button for numeric values. | [Docs](https://gnome-ui.org/react/?path=/docs/components-spinrow--docs) |
| `SplitButton` | Primary action button with an attached dropdown arrow. | [Docs](https://gnome-ui.org/react/?path=/docs/components-splitbutton--docs) |
| `StatusBadge` | Pill-shaped text label for entity status. Use for human-readable state labels like `published`, `beta`, or `new` — not for numeric counts (use `Badge` for those). | [Docs](https://gnome-ui.org/react/?path=/docs/components-statusbadge--docs) |
| `StatusPage` | Empty-state and status page following the Adwaita `AdwStatusPage` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-statuspage--docs) |
| `StepIndicator` | Numbered "Step X of Y" progress indicator for onboarding/wizard flows. | [Docs](https://gnome-ui.org/react/?path=/docs/components-stepindicator--docs) |
| `Switch` | On/off toggle following the Adwaita switch style. | [Docs](https://gnome-ui.org/react/?path=/docs/components-switch--docs) |
| `SwitchRow` | Activatable row with an integrated switch. | [Docs](https://gnome-ui.org/react/?path=/docs/components-switchrow--docs) |
| `Tabs` | Tab-based navigation following the Adwaita `AdwTabBar` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-tabs--docs) |
| `TagInput` | Type-to-add multi-value input rendering entries as removable `Chip`s in a `WrapBox`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-taginput--docs) |
| `TerminalView` | Scrollable terminal-style output area styled after GNOME Terminal. Intended for displaying logs, command output, or read-only text content. | [Docs](https://gnome-ui.org/react/?path=/docs/components-terminalview--docs) |
| `Text` | Typography component mirroring all [Adwaita text style classes](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html). | [Docs](https://gnome-ui.org/react/?path=/docs/components-text--docs) |
| `TextField` | Single-line text input with label, helper text, and error state. | [Docs](https://gnome-ui.org/react/?path=/docs/components-textfield--docs) |
| `TextTruncate` | Single/multi-line text truncation with an automatic tooltip revealing the full content on overflow — mirrors `GtkLabel`'s `ellipsize` property. | [Docs](https://gnome-ui.org/react/?path=/docs/components-texttruncate--docs) |
| `Timeline` | Ordered sequence of events connected by a visual timeline. | [Docs](https://gnome-ui.org/react/?path=/docs/components-timeline--docs) |
| `TimePicker` | Hour/minute selection built from paired [`SpinButton`](../SpinButton)s inside a [`Popover`](../Popover), behind an entry-styled trigger — mirrors the `GtkSpinButton` + `GtkPopover` composition GNOME apps use for time entry, with 12- and 24-hour support. | [Docs](https://gnome-ui.org/react/?path=/docs/components-timepicker--docs) |
| `Toast` | Non-blocking temporary notification following the Adwaita `AdwToast` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-toast--docs) |
| `ToggleGroup` | Mutually-exclusive group of toggle buttons for in-place option selection. | [Docs](https://gnome-ui.org/react/?path=/docs/components-togglegroup--docs) |
| `Toolbar` | Horizontal action bar following the libadwaita `.toolbar` pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-spacer--docs) |
| `ToolbarView` | Layout container that attaches bars at the top and/or bottom while scrolling only the middle content. | [Docs](https://gnome-ui.org/react/?path=/docs/components-toolbarview--docs) |
| `Tooltip` | Informational floating label following the GNOME HIG tooltip pattern. | [Docs](https://gnome-ui.org/react/?path=/docs/components-tooltip--docs) |
| `ViewSwitcher` | Segmented control for switching between major views, mirroring the Adwaita `AdwViewSwitcher`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-viewswitcher--docs) |
| `ViewSwitcherBar` | Bottom navigation bar for `ViewSwitcher` items on narrow screens (≤ 550 px), mirroring `AdwViewSwitcherBar`. | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-viewswitcherbar--docs) |
| `ViewSwitcherSidebar` | Sidebar-style view switcher for apps with many top-level views or when the sidebar layout fits better than a header-bar `ViewSwitcher`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-viewswitchersidebar--docs) |
| `VisuallyHidden` | Reusable "sr-only" utility — visually hides content while keeping it in the accessibility tree, so screen readers still announce it. | [Docs](https://gnome-ui.org/react/?path=/docs/components-visuallyhidden--docs) |
| `VulnerabilityFinding` |  | [Docs](https://gnome-ui.org/react/?path=/docs/components-vulnerabilityfinding--docs) |
| `VulnerabilitySummary` |  | [Docs](https://gnome-ui.org/react/) |
| `WidgetManager` | Card that manages a controlled collection of "widgets" picked from a `catalog`, each rendering its own content via `render()`. The header's edit button toggles a dashed "add widget" trigger that opens a catalog picker — `Modal`, `BottomSheet`, or `Drawer`, chosen with `pickerSurface`. Adding and removing is staged inside the picker and only applied through `onChange` when the user confirms; canceling discards the staging. Widgets can only be removed through the picker, not inline in the card. | [Docs](https://gnome-ui.org/react/?path=/docs/components-widgetmanager--docs) |
| `WindowTitle` | Two-line title + subtitle widget for use inside a `HeaderBar`. | [Docs](https://gnome-ui.org/react/?path=/docs/components-windowtitle--docs) |
| `WrapBox` | Flexible wrapping layout container. | [Docs](https://gnome-ui.org/react/?path=/docs/components-wrapbox--docs) |
<!-- /component-table:react -->

### Layout shells & dashboard (`@gnome-ui/layout`)

Live examples and documentation: **[Storybook →](https://gnome-ui.org/layout/)**

<!-- component-table:layout -->
| Component | Description | Story |
|-----------|-------------|-------|
| `ActivityFeed` | Chronological list of recent events with relative timestamps, optional icons, skeleton loading state, and a "Show more" affordance. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-activityfeed--docs) |
| `AdaptiveLayout` | Full-page adaptive shell that switches navigation automatically based on viewport width. Use the **viewport toolbar** to preview each breakpoint: | [Docs](https://gnome-ui.org/layout/?path=/docs/adaptive-adaptivelayout--docs) |
| `AppHeader` | GNOME application header with named shell slots. | [Docs](https://gnome-ui.org/layout/) |
| `ApplicationCard` | App detail header with avatar, name, badge, description, stat row, and actions. Designed for the MyApps `AppDetail` view — use `EntityCard` for list rows. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-applicationcard--docs) |
| `Banner` | Persistent in-app message strip shown at the top of a view, following GNOME HIG banner guidelines. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-banner--docs) |
| `ChartCard` |  | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-chartcard--docs) |
| `CounterCard` | Metric card with an animated numeric counter. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-countercard--docs) |
| `DashboardGrid` | Responsive 12-column grid container for dashboard widgets and panels. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-dashboardgrid--docs) |
| `EmptyState` | Centered empty-state illustration for views with no data. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-emptystate--docs) |
| `EntityCard` | Avatar/icon + title + meta card. Covers both compact grid cards (Following screen) and full-width list rows (MyApps screen) via additive optional props. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-entitycard--docs) |
| `ErrorState` | Error state with four presets that set a default icon and title. All defaults can be overridden via `icon` and `title` props. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-errorstate--docs) |
| `FileManager` | GNOME Files (Nautilus)–style file browser assembled from **`@gnome-ui/layout`** and **`@gnome-ui/react`** components. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-filemanager--docs) |
| `IconBadge` | Rounded-square tinted icon container. Accepts the seven gnome-ui named colors or any hex value (`#rgb` / `#rrggbb`). In both cases the background is rendered at 15% opacity via `color-mix`. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-iconbadge--docs) |
| `Layout` | Full-page application shell from **`@gnome-ui/layout`** that composes four named zones following the GNOME Human Interface Guidelines. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-layout--docs) |
| `LoadingStatus` | Visually hidden live region announcing a skeleton loading state to screen readers. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-loadingstatus--docs) |
| `MasonryGrid` | Masonry layout that distributes variable-height items across columns using a **shortest-column-first** algorithm — each new item is placed in the column with the least accumulated height, minimising gaps. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-masonrygrid--docs) |
| `PageContent` | Page content container with GNOME spacing and optional width clamping. | [Docs](https://gnome-ui.org/layout/) |
| `PanelCard` | Card with a structured **header / body / footer** layout and built-in collapse/expand behaviour. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-panelcard--docs) |
| `ProfileCard` | Dashboard card for displaying a user profile — avatar, name, handle, optional status dot, optional stats row, and an optional decorative background chart. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-profilecard--docs) |
| `ProgressCard` | Resource usage card with a labeled progress bar. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-progresscard--docs) |
| `QuickActions` | Grid of shortcut action buttons for dashboards, file managers, and control panels. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-quickactions--docs) |
| `ResizablePanel` | Two or more panels separated by a draggable divider, based on the `GtkPaned` pattern. Foundational for user-resizable master-detail layouts (code editors, file explorers, analytics dashboards). | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-resizablepanel--docs) |
| `SectionHeader` | Title row for dashboard sections with optional subtitle and trailing action slot. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-sectionheader--docs) |
| `Settings` | GNOME Settings–style preferences app assembled from **`@gnome-ui/layout`** and **`@gnome-ui/react`**. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-settings--docs) |
| `SidebarShell` | Full-height GNOME sidebar with fixed header/footer and scrollable navigation area. | [Docs](https://gnome-ui.org/layout/) |
| `SidebarTrigger` | Header button that opens overlay sidebars on narrow screens and toggles rail collapse on wider screens. | [Docs](https://gnome-ui.org/layout/) |
| `SplitLayout` | List/master + detail shell following the Adwaita `AdwNavigationSplitView` pattern, with a `HeaderBar` for each pane — the way real Adwaita apps (Settings, Files, Contacts) actually look, rather than the bare pane-toggle mechanics of `@gnome-ui/react`'s `NavigationSplitView` that this composes. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-splitlayout--docs) |
| `StatCard` | Metric card for dashboards with optional unit, trend indicator, icon, background chart, and loading state. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-statcard--docs) |
| `StatusBar` | Compact footer/status bar for application shells. | [Docs](https://gnome-ui.org/layout/) |
| `StatusIndicator` | Status dot for communicating the health of a service, connection, or resource. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-statusindicator--docs) |
| `StickyToc` | Sticky table-of-contents side rail with scroll-spy: the link for the section currently nearest the top of the viewport is highlighted automatically as the user scrolls. For long docs/settings pages. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-stickytoc--docs) |
| `TeamCard` | Group identity card: avatar group, team name, and member count. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-teamcard--docs) |
| `Toast` | In-app notifications following the GNOME Human Interface Guidelines. | [Docs](https://gnome-ui.org/layout/) |
| `UserCard` | User identity panel for popovers, sidebar footers, and profile pages. | [Docs](https://gnome-ui.org/layout/?path=/docs/layout-usercard--docs) |
<!-- /component-table:layout -->

### Data visualization (`@gnome-ui/charts`)

Live examples and documentation: **[Storybook →](https://gnome-ui.org/charts/)**

<!-- component-table:charts -->
| Component | Description | Story |
|-----------|-------------|-------|
| `AreaChart` | Area chart built on Recharts with GNOME design tokens, supporting stacked areas and gradient fills. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-areachart--docs) |
| `BarChart` | Bar chart built on Recharts with GNOME design tokens for grouped comparisons across categories. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-barchart--docs) |
| `BoxPlot` | Box-and-whisker plot built with plain HTML/CSS — no Recharts (it has no native box-plot primitive). Shows the distribution of one or more groups: median, interquartile range (Q1–Q3), whiskers extending to the most extreme non-outlier value, and outliers beyond 1.5×IQR. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-boxplot--docs) |
| `BulletChart` | Bullet graph (Stephen Few) built with plain SVG-free HTML — no Recharts. Shows a performance measure against a target and qualitative ranges in a single compact horizontal track, for KPI rows in tables and dashboards where `GaugeChart` takes too much vertical space. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-bulletchart--docs) |
| `CloudChart` | Word/tag cloud that scales each term's font size proportionally to its numeric value. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-cloudchart--docs) |
| `ComposedChart` | Mixed chart combining bars, lines, and areas on shared axes. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-composedchart--docs) |
| `FunnelChart` | Funnel visualization for conversion rates and sales pipelines. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-funnelchart--docs) |
| `GaugeChart` | Single-value speedometer gauge built on Recharts. Renders a semicircular arc between `min` and `max`, with the current value shown as a label at its center — for KPI dashboards, alongside `StatCard` from `@gnome-ui/layout`. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-gaugechart--docs) |
| `Heatmap` | Generic matrix heatmap built in pure CSS/SVG (no Recharts dependency) — for correlation matrices, density grids, or any row × column value grid. For a calendar-shaped activity heatmap, use `ContributionGraph` from `@gnome-ui/react` instead. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-heatmap--docs) |
| `LineChart` | Line chart built on Recharts with GNOME design tokens for axes, grid, and tooltips. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-linechart--docs) |
| `PieChart` | Pie and donut chart built on Recharts for part-to-whole comparisons. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-piechart--docs) |
| `RadarChart` | Radar (spider) chart built on Recharts for comparing multiple attributes across one or more subjects. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-radarchart--docs) |
| `RadialBarChart` | Radial bar chart built on Recharts. Each data item renders as a circular arc, useful for showing multiple metrics as circular progress rings. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-radialbarchart--docs) |
| `SankeyChart` | Flow diagram built on Recharts. Renders named nodes as columns of rectangles connected by curved, proportionally-sized links — for multi-stage funnels, user journeys, or any flow between categories. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-sankeychart--docs) |
| `ScatterChart` | Scatter and bubble chart for visualizing correlation between two numeric variables. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-scatterchart--docs) |
| `TreeMap` | Tree map built on Recharts. Displays hierarchical data as nested rectangles; area is proportional to each item's value. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-treemap--docs) |
| `WaterfallChart` | Floating-bar chart built on Recharts for the cumulative effect of a sequence of increases and decreases — revenue bridges, budget breakdowns, cohort attrition. Each bar starts where the previous one ended; mark `isTotal` on start/end/subtotal bars to anchor them to zero instead. | [Docs](https://gnome-ui.org/charts/?path=/docs/charts-waterfallchart--docs) |
<!-- /component-table:charts -->

See [ROADMAP.md](https://github.com/ElJijuna/gnome-ui/blob/main/ROADMAP.md) for the full list of planned components.

## Development

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```bash
git clone https://github.com/your-org/gnome-react.git
cd gnome-react
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |
| `npm run storybook` | Start Storybook dev server at `localhost:6006` |
| `npm run build-storybook` | Build Storybook for production |
| `npm run typecheck` | Type-check all packages |
| `npm run lint` | Lint all packages |

### Project structure

```
gnome-ui/
├── packages/
│   ├── core/          # @gnome-ui/core     — CSS design tokens
│   ├── icons/         # @gnome-ui/icons    — Adwaita icon definitions (SVG path data)
│   ├── react/         # @gnome-ui/react    — React components
│   ├── layout/        # @gnome-ui/layout   — Application shell & dashboard components
│   ├── platform/      # @gnome-ui/platform — GNOME host bridge (GSettings, portals…)
│   ├── hooks/         # @gnome-ui/hooks    — React hooks for platform APIs
│   └── charts/        # @gnome-ui/charts   — Adwaita-styled chart components
├── GNOME_GUIDELINES.md
├── ROADMAP.md
└── turbo.json
```

## Contributing

Read [CONTRIBUTING.md](https://github.com/ElJijuna/gnome-ui/blob/main/CONTRIBUTING.md) before opening a pull request.

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages determine the next version automatically via semantic-release:

| Prefix | Release |
|--------|---------|
| `feat:` | minor |
| `fix:`, `perf:`, `refactor:` | patch |
| `feat!:` or `BREAKING CHANGE:` | major |
| `chore:`, `docs:`, `test:` | no release |

## License

[MIT](https://github.com/ElJijuna/gnome-ui/blob/main/LICENSE) © el_jijuna

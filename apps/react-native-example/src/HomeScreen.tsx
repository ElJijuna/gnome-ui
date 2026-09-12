import {
  AuthFace,
  FormatTextRich,
  InputKeyboard,
  Notifications,
  Search,
  StartHere,
  ViewAppGrid,
  ViewList,
  ViewPin,
  ViewSidebar,
} from '@gnome-ui/icons';
import {
  Badge,
  BoxedList,
  BreakpointBin,
  Button,
  Chip,
  Highlight,
  Icon,
  SearchBar,
  StatusBadge,
  StatusPage,
  Text,
  useGnomeTheme,
  WrapBox,
} from '@gnome-ui/react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { COMPONENT_NAMES, type ComponentName } from './types';

const DESCRIPTIONS: Record<ComponentName, string> = {
  Button: 'Default, suggested, destructive, flat, pill, circular',
  Text: 'All 12 Adwaita typography styles and 7 semantic colors',
  Link: 'Inline hyperlink, external-URL indicator',
  TextField: 'Label, helper text, error state',
  Switch: 'On/off toggle',
  Checkbox: 'Unchecked, checked, indeterminate',
  RadioButton: 'Single selection within a manually-managed group',
  Separator: 'Horizontal and vertical dividing line',
  Card: 'Elevated surface, static or interactive, 4 padding sizes',
  BoxedList: 'Rounded bordered list, default and separate variants',
  ActionRow: 'Title, subtitle, leading/trailing slots, property variant',
  HeaderBar: 'Centered title, leading/trailing slots, flat variant',
  Tabs: 'TabBar, TabItem, TabPanel — icons, badges, closeable',
  ViewSwitcher: 'Pill-shaped segmented control for switching major views',
  Sidebar: 'Lateral navigation panel — sections, icons, collapsed rail, filtering',
  SearchBar: 'Collapsible search input — clear button, close button, filter row',
  PathBar: 'Breadcrumb location bar — interactive ancestors, static current folder',
  Spinner: 'Indeterminate loading ring — 3 sizes, reduced-motion aware',
  ProgressBar: 'Determinate and indeterminate progress — 4 color variants',
  Skeleton: 'Content-shaped loading placeholder — rect, circle, text',
  Toast: 'Non-blocking notification — auto-dismiss, action, top/bottom',
  Banner: 'Persistent message strip — 4 variants, action, dismissible',
  Dialog: 'Blocking modal — title, body, buttons, and the alertdialog API',
  Tooltip: 'Floating label — long-press, hover, or focus to trigger; auto-flips',
  Icon: 'Inline SVG icon from @gnome-ui/icons, simple-icons, or a raw path',
  AnimatedIcon: 'Plays Syncing/Recording/Downloading/Connecting — static via Icon otherwise',
  Dropdown: 'Expandable option list — descriptions, disabled options, flips to fit',
  Slider: 'Draggable range control — marks, custom step, adjustable accessibility action',
  SpinButton: 'Numeric −/+ stepper — wrap, custom format, decimals from step',
  Avatar: 'Circular image or initials fallback — deterministic color from name, 4 sizes',
  Badge: 'Counter or status dot — 5 variants, optionally anchored on another element',
  Popover: 'Floating panel with rich content — auto-flips, closes on outside tap',
  BottomSheet: 'Slide-up panel from the bottom edge — drag the handle down to dismiss',
  BottomTabBar: 'Fixed bottom navigation bar — accent-tinted active tab, optional badges',
  Overlay: 'Standalone backdrop with fade transition and press-to-dismiss',
  LevelBar: 'Gauge/measurement indicator — continuous fill or discrete blocks, low/high zones',
  Expander: 'Disclosure triangle + collapsible content — animated height reveal',
  Divider: 'Horizontal rule with an optional centered label — "OR" between sign-in methods',
  Highlight: 'Highlights every occurrence of a search term within a string',
  FileTypeIcon: 'Icon resolved from a MIME type or file name extension, or a thumbnail',
  Chip: 'Pill-shaped label — static, removable, or a selectable toggle',
  SegmentedBar: 'Proportional category breakdown — repository language distribution',
  IconButton: 'Icon-only action button — Button + Icon + optional Tooltip',
  Drawer: 'Slide-in panel from the left or right edge — title, rail, nested width scaling',
  AvatarGroup: 'Overlapping stack of avatars with a "+N" overflow indicator',
  AvatarRotator: 'Single avatar surface that crossfades through multiple image sources',
  CoachMark: 'Spotlight a UI element and anchor a callout bubble beside it',
  Clamp: 'Caps content at a readable maximum width and centers it',
  Box: 'Flex layout primitive — orientation, HIG spacing scale, align, justify',
  BreakpointBin: 'Container-query breakpoints — reacts to its own width, not the window',
  WrapBox: 'Wrapping row — items reflow onto new lines, separate child/line gaps',
  StatusPage: 'Empty state — big icon, title, description, and a way forward',
  ToggleGroup: 'Mutually-exclusive toggle buttons — icon, label, or both',
  InlineViewSwitcher: 'Inline switcher — 4 variants, sliding indicator, 4 overflow modes',
  PreferencesGroup: 'Titled settings section — heading, description, header suffix',
  EntryRow: 'Boxed-list row with an inline text field and a floating label',
  PasswordEntryRow: 'EntryRow that masks its input, with a reveal/conceal toggle',
  ComboRow: 'Settings row with an inline option selector at the trailing edge',
  SpinRow: 'Settings row with an integrated spin button at the trailing edge',
  ColorPicker: 'Circular color swatches — Adwaita palette, sizes, custom hook',
  Bin: 'Single-child container with no visual styling of its own',
  Blockquote: 'Pull-quote with a colored left border — 5 severity variants, optional icon/cite',
  ButtonContent:
    'Icon + label layout helper — for composing button-style content outside Button itself',
  ButtonRow: 'Full-width activatable row styled as a button, for use inside a BoxedList',
  Callout: 'Inline dismissible admonition box — info/warning/tip variants',
  CheckRow: 'Activatable row with an integrated checkbox — press anywhere to toggle',
  ExpanderRow: 'Collapsible ActionRow that reveals nested rows on activation',
  FieldGroup: 'Labeled grouping with helper/error text for arbitrary form fields',
  MultiSelectDropdown: 'Checkbox-list dropdown for selecting multiple values from one trigger',
  FilterableMultiSelectDropdown: 'MultiSelectDropdown plus a filter field for long option lists',
  PasswordField: 'TextField with a peek toggle to reveal the value as plain text',
  RangeSlider: 'Dual-thumb slider for selecting a min/max range',
  StatusBadge: 'Pill-shaped text label for entity status — published, beta, new, etc.',
};

type CategoryKey =
  | 'foundations'
  | 'actions'
  | 'forms'
  | 'layout'
  | 'navigation'
  | 'feedback'
  | 'overlays'
  | 'avatars';

/** Every gallery entry, grouped by the kind of problem it solves rather than tier/ship order. */
const CATEGORIES: { key: CategoryKey; label: string; icon: typeof ViewAppGrid }[] = [
  { key: 'foundations', label: 'Foundations', icon: FormatTextRich },
  { key: 'actions', label: 'Buttons & Actions', icon: StartHere },
  { key: 'forms', label: 'Forms & Inputs', icon: InputKeyboard },
  { key: 'layout', label: 'Layout & Lists', icon: ViewList },
  { key: 'navigation', label: 'Navigation', icon: ViewSidebar },
  { key: 'feedback', label: 'Feedback & Status', icon: Notifications },
  { key: 'overlays', label: 'Overlays', icon: ViewPin },
  { key: 'avatars', label: 'Avatars & Media', icon: AuthFace },
];

const CATEGORY_OF: Record<ComponentName, CategoryKey> = {
  Text: 'foundations',
  Link: 'foundations',
  Highlight: 'foundations',
  Icon: 'foundations',
  AnimatedIcon: 'foundations',
  FileTypeIcon: 'foundations',

  Button: 'actions',
  ButtonContent: 'actions',
  ButtonRow: 'actions',
  IconButton: 'actions',
  ToggleGroup: 'actions',
  Chip: 'actions',

  TextField: 'forms',
  Switch: 'forms',
  Checkbox: 'forms',
  RadioButton: 'forms',
  SpinButton: 'forms',
  Slider: 'forms',
  RangeSlider: 'forms',
  ColorPicker: 'forms',
  ComboRow: 'forms',
  SpinRow: 'forms',
  EntryRow: 'forms',
  PasswordEntryRow: 'forms',
  FieldGroup: 'forms',
  CheckRow: 'forms',
  Dropdown: 'forms',
  MultiSelectDropdown: 'forms',
  FilterableMultiSelectDropdown: 'forms',
  SearchBar: 'forms',
  PasswordField: 'forms',

  Separator: 'layout',
  Card: 'layout',
  BoxedList: 'layout',
  ActionRow: 'layout',
  Bin: 'layout',
  Box: 'layout',
  WrapBox: 'layout',
  Clamp: 'layout',
  Divider: 'layout',
  BreakpointBin: 'layout',
  PreferencesGroup: 'layout',
  Expander: 'layout',
  ExpanderRow: 'layout',

  HeaderBar: 'navigation',
  Tabs: 'navigation',
  ViewSwitcher: 'navigation',
  Sidebar: 'navigation',
  PathBar: 'navigation',
  BottomTabBar: 'navigation',
  Drawer: 'navigation',
  InlineViewSwitcher: 'navigation',

  Spinner: 'feedback',
  ProgressBar: 'feedback',
  Skeleton: 'feedback',
  Toast: 'feedback',
  Banner: 'feedback',
  Dialog: 'feedback',
  Tooltip: 'feedback',
  StatusPage: 'feedback',
  StatusBadge: 'feedback',
  Badge: 'feedback',
  LevelBar: 'feedback',
  Callout: 'feedback',
  Blockquote: 'feedback',

  Popover: 'overlays',
  BottomSheet: 'overlays',
  Overlay: 'overlays',
  CoachMark: 'overlays',

  Avatar: 'avatars',
  AvatarGroup: 'avatars',
  AvatarRotator: 'avatars',
  SegmentedBar: 'avatars',
};

/** The two most recently shipped components — called out with a `StatusBadge` so they stand out in the gallery. */
const NEW_COMPONENTS = new Set<ComponentName>(['BreakpointBin', 'ButtonContent']);

const CATEGORY_LABEL: Record<CategoryKey, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
) as Record<CategoryKey, string>;

export interface HomeScreenProps {
  onSelect: (name: ComponentName) => void;
}

interface ComponentRowProps {
  name: ComponentName;
  query: string;
  onPress: () => void;
}

/** One tappable gallery entry — the name/description highlight the live search term. */
const ComponentRow = ({ name, query, onPress }: ComponentRowProps) => {
  const theme = useGnomeTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.space2,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: pressed ? theme.activeOverlay : 'transparent',
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space1 }}>
          <Highlight text={name} query={query} variant="body" />
          {NEW_COMPONENTS.has(name) && <StatusBadge variant="new">new</StatusBadge>}
        </View>
        <Highlight text={DESCRIPTIONS[name]} query={query} variant="caption" color="dim" />
      </View>
      <Text variant="body" color="dim">
        {'›'}
      </Text>
    </Pressable>
  );
};

interface CategoryBlockProps {
  category: (typeof CATEGORIES)[number];
  names: ComponentName[];
  query: string;
  /**
   * Pixel width for this block, or `undefined` to fill the row (`100%`).
   * A plain `'48%'` looked right in principle but Yoga wouldn't actually
   * pack two of them side by side inside a `flexWrap` row — the same
   * "don't trust a Yoga percentage trick, measure and use pixels instead"
   * lesson this package already learned from `Slider`/`ProgressBar`.
   */
  widthPx?: number;
  onSelect: (name: ComponentName) => void;
}

/** One category's heading + boxed list of matching rows. */
const CategoryBlock = ({ category, names, query, widthPx, onSelect }: CategoryBlockProps) => {
  const theme = useGnomeTheme();

  return (
    <View
      style={{
        width: widthPx ?? '100%',
        gap: theme.space1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space1 }}>
        <Icon icon={category.icon} size="sm" />
        <Text variant="heading" style={{ flex: 1 }}>
          {category.label}
        </Text>
        <Badge variant="neutral">{names.length}</Badge>
      </View>
      <BoxedList>
        {names.map((name) => (
          <ComponentRow key={name} name={name} query={query} onPress={() => onSelect(name)} />
        ))}
      </BoxedList>
    </View>
  );
};

export const HomeScreen = ({ onSelect }: HomeScreenProps) => {
  const theme = useGnomeTheme();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all');

  const visibleByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = new Map<CategoryKey, ComponentName[]>();

    for (const name of COMPONENT_NAMES) {
      const category = CATEGORY_OF[name];

      if (activeCategory !== 'all' && category !== activeCategory) {
        continue;
      }
      if (q && !name.toLowerCase().includes(q) && !DESCRIPTIONS[name].toLowerCase().includes(q)) {
        continue;
      }

      const list = groups.get(category);
      if (list) {
        list.push(name);
      } else {
        groups.set(category, [name]);
      }
    }

    return groups;
  }, [query, activeCategory]);

  const totalVisible = useMemo(
    () => [...visibleByCategory.values()].reduce((sum, list) => sum + list.length, 0),
    [visibleByCategory],
  );

  return (
    <BreakpointBin breakpoints={[{ name: 'compact', maxWidth: 699 }]} style={{ flex: 1 }}>
      {({ activeBreakpoint, width }) => {
        const wide = activeBreakpoint !== 'compact';
        const screenPadding = 16 * 2;
        const gap = 20;
        const contentWidth = width - screenPadding;
        const blockWidthPx =
          width <= 0 ? undefined : wide ? (contentWidth - gap) / 2 : contentWidth;

        return (
          <View style={{ flex: 1 }}>
            <SearchBar
              open
              inline
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery('')}
              placeholder="Search components…"
              style={{ paddingHorizontal: 16, paddingTop: 8 }}
            >
              <Chip
                label="All"
                icon={ViewAppGrid}
                selectable
                selected={activeCategory === 'all'}
                onToggle={() => setActiveCategory('all')}
              />
              {CATEGORIES.map((category) => (
                <Chip
                  key={category.key}
                  label={category.label}
                  icon={category.icon}
                  selectable
                  selected={activeCategory === category.key}
                  onToggle={() =>
                    setActiveCategory((current) =>
                      current === category.key ? 'all' : category.key,
                    )
                  }
                />
              ))}
            </SearchBar>

            <Text
              variant="caption"
              color="dim"
              style={{ paddingHorizontal: 16, paddingTop: theme.space1 }}
            >
              {totalVisible} of {COMPONENT_NAMES.length} components
              {wide ? ' · showing a 2-column layout on this wide window' : ''}
            </Text>

            {totalVisible === 0 ? (
              <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
                <StatusPage
                  icon={Search}
                  title="No matches"
                  description={
                    activeCategory === 'all'
                      ? `Nothing found for "${query}".`
                      : `Nothing found for "${query}" in ${CATEGORY_LABEL[activeCategory]}.`
                  }
                  compact
                >
                  <Button
                    variant="flat"
                    onPress={() => {
                      setQuery('');
                      setActiveCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </StatusPage>
              </View>
            ) : (
              <ScrollView
                contentInsetAdjustmentBehavior="never"
                contentContainerStyle={{ padding: 16 }}
              >
                <WrapBox
                  childSpacing={20}
                  lineSpacing={20}
                  align="start"
                  style={!wide ? { flexDirection: 'column', flexWrap: 'nowrap' } : undefined}
                >
                  {CATEGORIES.filter((category) => visibleByCategory.has(category.key)).map(
                    (category) => (
                      <CategoryBlock
                        key={category.key}
                        category={category}
                        names={visibleByCategory.get(category.key) ?? []}
                        query={query}
                        widthPx={blockWidthPx}
                        onSelect={onSelect}
                      />
                    ),
                  )}
                </WrapBox>
              </ScrollView>
            )}
          </View>
        );
      }}
    </BreakpointBin>
  );
};

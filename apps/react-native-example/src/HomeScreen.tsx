import { Separator, Text, useGnomeTheme } from '@gnome-ui/react-native';
import { Fragment } from 'react';
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
};

export interface HomeScreenProps {
  onSelect: (name: ComponentName) => void;
}

export const HomeScreen = ({ onSelect }: HomeScreenProps) => {
  const theme = useGnomeTheme();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {COMPONENT_NAMES.map((name, index) => (
        <Fragment key={name}>
          {index > 0 && <Separator style={{ marginHorizontal: 16 }} />}
          <Pressable
            onPress={() => onSelect(name)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: pressed ? theme.activeOverlay : 'transparent',
            })}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="body">{name}</Text>
              <Text variant="caption" color="dim">
                {DESCRIPTIONS[name]}
              </Text>
            </View>
            <Text variant="body" color="dim">
              {'›'}
            </Text>
          </Pressable>
        </Fragment>
      ))}
    </ScrollView>
  );
};

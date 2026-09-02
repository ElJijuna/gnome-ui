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
};

export interface HomeScreenProps {
  onSelect: (name: ComponentName) => void;
}

export const HomeScreen = ({ onSelect }: HomeScreenProps) => {
  const theme = useGnomeTheme();

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
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

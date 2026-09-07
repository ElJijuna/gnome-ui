import {
  Applications,
  FormatJustifyCenter,
  FormatJustifyFill,
  FormatJustifyLeft,
  FormatJustifyRight,
  FormatTextBold,
  FormatTextItalic,
  FormatTextUnderline,
  ViewSidebar,
} from '@gnome-ui/icons';
import { Text, ToggleGroup, ToggleGroupItem } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const ToggleGroupScreen = () => {
  const [align, setAlign] = useState('left');
  const [view, setView] = useState('grid');
  const [density, setDensity] = useState('comfortable');
  const [emphasis, setEmphasis] = useState('bold');

  return (
    <>
      <Section title="Icon only" description="Alignment picker — each item needs its own label">
        <View style={{ alignItems: 'flex-start', gap: 8 }}>
          <ToggleGroup value={align} onValueChange={setAlign} accessibilityLabel="Alignment">
            <ToggleGroupItem name="left" icon={FormatJustifyLeft} accessibilityLabel="Left" />
            <ToggleGroupItem name="center" icon={FormatJustifyCenter} accessibilityLabel="Center" />
            <ToggleGroupItem name="right" icon={FormatJustifyRight} accessibilityLabel="Right" />
            <ToggleGroupItem name="fill" icon={FormatJustifyFill} accessibilityLabel="Justify" />
          </ToggleGroup>
          <Text variant="caption" color="dim">
            {align}
          </Text>
        </View>
      </Section>

      <Section title="Icon + label" description="View-mode selector">
        <View style={{ alignItems: 'flex-start', gap: 8 }}>
          <ToggleGroup value={view} onValueChange={setView} accessibilityLabel="View mode">
            <ToggleGroupItem name="grid" icon={Applications} label="Grid" />
            <ToggleGroupItem name="list" icon={ViewSidebar} label="List" />
          </ToggleGroup>
          <Text variant="caption" color="dim">
            {view}
          </Text>
        </View>
      </Section>

      <Section title="Label only" description="No icons at all">
        <View style={{ alignItems: 'flex-start', gap: 8 }}>
          <ToggleGroup value={density} onValueChange={setDensity} accessibilityLabel="Density">
            <ToggleGroupItem name="compact" label="Compact" />
            <ToggleGroupItem name="comfortable" label="Comfortable" />
            <ToggleGroupItem name="spacious" label="Spacious" />
          </ToggleGroup>
          <Text variant="caption" color="dim">
            {density}
          </Text>
        </View>
      </Section>

      <Section title="Disabled item" description="Underline is unavailable here">
        <View style={{ alignItems: 'flex-start' }}>
          <ToggleGroup value={emphasis} onValueChange={setEmphasis} accessibilityLabel="Emphasis">
            <ToggleGroupItem name="bold" icon={FormatTextBold} accessibilityLabel="Bold" />
            <ToggleGroupItem name="italic" icon={FormatTextItalic} accessibilityLabel="Italic" />
            <ToggleGroupItem
              name="underline"
              icon={FormatTextUnderline}
              accessibilityLabel="Underline"
              disabled
            />
          </ToggleGroup>
        </View>
      </Section>
    </>
  );
};

import {
  ActionRow,
  BoxedList,
  ColorPicker,
  ColorSwatch,
  GNOME_PALETTE,
  PreferencesGroup,
  Text,
} from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const CUSTOM_COLORS = ['#ff4d8d', '#00c2a8', '#7a5cff'];

export const ColorPickerScreen = () => {
  const [accent, setAccent] = useState('#3584e4');
  const [small, setSmall] = useState('#2ec27e');
  const [large, setLarge] = useState('#f6d32d');
  const [custom, setCustom] = useState('#3584e4');
  const [customIndex, setCustomIndex] = useState(0);

  return (
    <>
      <Section title="Default palette" description="The 9 Adwaita named colors">
        <ColorPicker value={accent} onChange={setAccent} />
        <Text variant="caption" color="dim">
          value: {accent}
        </Text>
      </Section>

      <Section title="Sizes" description="sm 22, md 30, lg 38 dp">
        <View style={{ gap: 12 }}>
          <ColorPicker size="sm" value={small} onChange={setSmall} />
          <ColorPicker value={accent} onChange={setAccent} />
          <ColorPicker size="lg" value={large} onChange={setLarge} />
        </View>
      </Section>

      <Section
        title="allowCustom"
        description="The + asks the app for a picker — RN has no native color input"
      >
        <ColorPicker
          allowCustom
          value={custom}
          onChange={setCustom}
          onRequestCustom={() => {
            const next = CUSTOM_COLORS[customIndex % CUSTOM_COLORS.length] ?? '#ff4d8d';

            setCustomIndex((index) => index + 1);
            setCustom(next);
          }}
        />
        <Text variant="caption" color="dim">
          value: {custom}
        </Text>
      </Section>

      <Section title="Standalone swatches" description="ColorSwatch on its own">
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <ColorSwatch color="#3584e4" accessibilityLabel="Blue" selected />
          <ColorSwatch color="#f6d32d" accessibilityLabel="Yellow" selected />
          <ColorSwatch color="#e01b24" accessibilityLabel="Red" />
          <ColorSwatch color="#5e5c64" accessibilityLabel="Slate" disabled />
        </View>
      </Section>

      <Section title="Disabled" description="Whole group dimmed and inert">
        <ColorPicker allowCustom value="#e01b24" disabled />
      </Section>

      <Section title="In a settings page" description="The MyNpmLens accent-color shape">
        <PreferencesGroup title="Appearance" description="Pick the accent color for the app.">
          <BoxedList>
            <ActionRow
              title="Accent color"
              subtitle={GNOME_PALETTE.find((color) => color.value === accent)?.label ?? 'Custom'}
            />
          </BoxedList>
          <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
            <ColorPicker value={accent} onChange={setAccent} />
          </View>
        </PreferencesGroup>
      </Section>

      <View style={{ height: 200 }} />
    </>
  );
};

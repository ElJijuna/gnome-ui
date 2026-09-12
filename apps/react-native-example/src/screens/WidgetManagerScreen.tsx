import { Alarm, AudioVolumeHigh, ViewGrid } from '@gnome-ui/icons';
import { Text, type WidgetDefinition, WidgetManager } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const placeholder = (width: number) => (
  <View
    style={{
      width: `${width}%`,
      height: 12,
      borderRadius: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    }}
  />
);

const catalog: WidgetDefinition[] = [
  {
    id: 'clock',
    label: 'Clock',
    description: 'Shows the current time',
    icon: Alarm,
    render: () => (
      <View style={{ gap: 8 }}>
        {placeholder(60)}
        {placeholder(40)}
      </View>
    ),
  },
  {
    id: 'weather',
    label: 'Weather',
    description: 'Local forecast at a glance',
    icon: AudioVolumeHigh,
    render: () => (
      <View style={{ gap: 8 }}>
        {placeholder(80)}
        {placeholder(50)}
        {placeholder(65)}
      </View>
    ),
  },
  {
    id: 'notes',
    label: 'Notes',
    description: 'Pinned sticky notes',
    render: () => <View style={{ gap: 8 }}>{placeholder(90)}</View>,
  },
];

export const WidgetManagerScreen = () => {
  const [dialogValue, setDialogValue] = useState(['clock']);
  const [sheetValue, setSheetValue] = useState<string[]>([]);
  const [drawerValue, setDrawerValue] = useState<string[]>([]);

  return (
    <>
      <Section title="Dialog picker" description="Default — the picker opens as a Dialog">
        <WidgetManager
          title="My Dashboard"
          icon={ViewGrid}
          catalog={catalog}
          value={dialogValue}
          onChange={setDialogValue}
        />
        <Text variant="caption" color="dim">
          value: {dialogValue.join(', ') || '(none)'}
        </Text>
      </Section>

      <Section title="BottomSheet picker">
        <WidgetManager
          title="Home Screen"
          catalog={catalog}
          value={sheetValue}
          onChange={setSheetValue}
          pickerSurface="bottomSheet"
        />
      </Section>

      <Section title="Drawer picker">
        <WidgetManager
          title="Workspace"
          catalog={catalog}
          value={drawerValue}
          onChange={setDrawerValue}
          pickerSurface="drawer"
        />
      </Section>

      <Section title="Empty catalog" description="Opening the picker never crashes">
        <WidgetManager title="Nothing to add" catalog={[]} value={[]} onChange={() => {}} />
      </Section>
    </>
  );
};

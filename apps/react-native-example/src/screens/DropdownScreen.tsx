import { Dropdown, type DropdownOption } from '@gnome-ui/react-native';
import { useState } from 'react';

import { Section } from '../Section';

const COLORS: DropdownOption[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'orange', label: 'Orange', disabled: true },
  { value: 'red', label: 'Red' },
];

const NETWORKS: DropdownOption[] = [
  { value: 'home', label: 'Home Wi-Fi', description: 'Connected' },
  { value: 'office', label: 'Office Wi-Fi', description: 'Saved' },
  { value: 'hotspot', label: "Phone's Hotspot", description: 'Personal hotspot' },
];

export const DropdownScreen = () => {
  const [color, setColor] = useState<string | undefined>();
  const [network, setNetwork] = useState<string | undefined>('home');

  return (
    <>
      <Section title="Basic" description="No selection until the user picks one">
        <Dropdown
          options={COLORS}
          value={color}
          onChange={setColor}
          placeholder="Accent color"
          accessibilityLabel="Accent color"
        />
      </Section>

      <Section
        title="With descriptions"
        description="A pre-selected value, options with a subtitle"
      >
        <Dropdown
          options={NETWORKS}
          value={network}
          onChange={setNetwork}
          accessibilityLabel="Wi-Fi network"
        />
      </Section>

      <Section title="Disabled" description="The whole control cannot be opened">
        <Dropdown options={COLORS} placeholder="Accent color" disabled />
      </Section>
    </>
  );
};

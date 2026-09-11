import { MultiSelectDropdown, type MultiSelectDropdownOption } from '@gnome-ui/react-native';
import { useState } from 'react';

import { Section } from '../Section';

const OPTIONS: MultiSelectDropdownOption[] = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'bluetooth', label: 'Bluetooth' },
  { value: 'location', label: 'Location Services', description: 'Used by maps and weather' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'nfc', label: 'NFC', disabled: true },
];

export const MultiSelectDropdownScreen = () => {
  const [permissions, setPermissions] = useState<string[]>(['wifi']);

  return (
    <>
      <Section title="Basic" description="Toggling an option keeps the panel open">
        <MultiSelectDropdown
          options={OPTIONS}
          value={permissions}
          onChange={setPermissions}
          placeholder="Select permissions"
          accessibilityLabel="Permissions"
        />
      </Section>

      <Section title="Disabled" description="No press response, dimmed trigger">
        <MultiSelectDropdown
          options={OPTIONS}
          value={['wifi', 'bluetooth']}
          onChange={() => {}}
          disabled
        />
      </Section>
    </>
  );
};

import { Switch, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const LabeledSwitch = ({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
      />
    </View>
  );
};

export const SwitchScreen = () => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airplaneMode, setAirplaneMode] = useState(false);

  return (
    <>
      <Section title="Controlled">
        <View style={{ gap: 16 }}>
          <LabeledSwitch label="Wi-Fi" value={wifi} onValueChange={setWifi} />
          <LabeledSwitch label="Bluetooth" value={bluetooth} onValueChange={setBluetooth} />
          <LabeledSwitch
            label="Airplane Mode"
            value={airplaneMode}
            onValueChange={setAirplaneMode}
          />
        </View>
      </Section>

      <Section title="Disabled">
        <View style={{ gap: 16 }}>
          <LabeledSwitch label="Off, disabled" value={false} disabled />
          <LabeledSwitch label="On, disabled" value disabled />
        </View>
      </Section>
    </>
  );
};

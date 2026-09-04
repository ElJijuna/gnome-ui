import { SpinButton, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const SpinButtonScreen = () => {
  const [quantity, setQuantity] = useState(3);
  const [temperature, setTemperature] = useState(21.5);
  const [hour, setHour] = useState(9);

  return (
    <>
      <Section title="Basic" description="Tap −/+ or use VoiceOver/TalkBack's adjust gesture">
        <SpinButton
          value={quantity}
          onChange={setQuantity}
          min={0}
          max={10}
          accessibilityLabel="Quantity"
        />
      </Section>

      <Section title="Fractional step" description="0.5°C increments between 16 and 28">
        <SpinButton
          value={temperature}
          onChange={setTemperature}
          min={16}
          max={28}
          step={0.5}
          accessibilityLabel="Target temperature"
        />
      </Section>

      <Section title="Wrap + custom format" description="Cycles 0–23, zero-padded to HH:00">
        <View style={{ gap: 8 }}>
          <SpinButton
            value={hour}
            onChange={setHour}
            min={0}
            max={23}
            wrap
            format={(v) => `${v.toString().padStart(2, '0')}:00`}
            accessibilityLabel="Alarm hour"
          />
          <Text variant="caption" color="dim">
            Stepping past 23 wraps to 0, and vice versa — the −/+ buttons never disable.
          </Text>
        </View>
      </Section>

      <Section title="Disabled">
        <SpinButton value={5} onChange={() => {}} disabled accessibilityLabel="Locked control" />
      </Section>
    </>
  );
};

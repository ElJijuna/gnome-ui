import { Slider, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const SliderScreen = () => {
  const [volume, setVolume] = useState(40);
  const [brightness, setBrightness] = useState(75);
  const [temperature, setTemperature] = useState(21);

  return (
    <>
      <Section
        title="Basic"
        description="Drag the thumb or use VoiceOver/TalkBack's adjust gesture"
      >
        <View style={{ gap: 8 }}>
          <Slider value={volume} onChange={setVolume} accessibilityLabel="Volume" />
          <Text variant="caption" color="dim">
            {volume}%
          </Text>
        </View>
      </Section>

      <Section title="Custom range and step" description="0.5°C increments between 16 and 28">
        <View style={{ gap: 8 }}>
          <Slider
            value={temperature}
            onChange={setTemperature}
            min={16}
            max={28}
            step={0.5}
            accessibilityLabel="Target temperature"
          />
          <Text variant="caption" color="dim">
            {temperature}°C
          </Text>
        </View>
      </Section>

      <Section title="Marks with labels" description="Tick marks along the track, labels below it">
        <Slider
          value={brightness}
          onChange={setBrightness}
          accessibilityLabel="Brightness"
          marks={[
            { value: 0, label: 'Off' },
            { value: 50, label: 'Auto' },
            { value: 100, label: 'Max' },
          ]}
        />
      </Section>

      <Section title="Disabled">
        <Slider value={60} onChange={() => {}} disabled accessibilityLabel="Locked control" />
      </Section>
    </>
  );
};

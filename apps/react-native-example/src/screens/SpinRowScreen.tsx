import { Alarm, AudioVolumeHigh } from '@gnome-ui/icons';
import { BoxedList, Icon, PreferencesGroup, SpinRow, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const SpinRowScreen = () => {
  const [volume, setVolume] = useState(60);
  const [timeout_, setTimeout_] = useState(30);
  const [uncontrolled, setUncontrolled] = useState(1);

  return (
    <>
      <Section title="Basic" description="Title plus a spin button at the trailing edge">
        <BoxedList>
          <SpinRow title="Volume" value={volume} onValueChange={setVolume} min={0} max={100} />
        </BoxedList>
        <Text variant="caption" color="dim">
          value: {volume}
        </Text>
      </Section>

      <Section title="With subtitle and leading icon" description="The full ActionRow shape">
        <BoxedList>
          <SpinRow
            title="Screen timeout"
            subtitle="Seconds before the screen locks"
            leading={<Icon icon={Alarm} />}
            value={timeout_}
            onValueChange={setTimeout_}
            min={5}
            max={300}
            step={5}
          />
        </BoxedList>
      </Section>

      <Section title="Disabled" description="Row dimmed, spin button unavailable">
        <BoxedList>
          <SpinRow
            title="Output level"
            subtitle="Managed by your organisation"
            leading={<Icon icon={AudioVolumeHigh} />}
            value={50}
            disabled
          />
        </BoxedList>
      </Section>

      <Section title="A settings page" description="Several rows in one PreferencesGroup">
        <PreferencesGroup title="Audio" description="Applies to this device only.">
          <BoxedList>
            <SpinRow title="Volume" value={volume} onValueChange={setVolume} min={0} max={100} />
            <SpinRow
              title="Balance"
              defaultValue={1}
              min={-10}
              max={10}
              onValueChange={setUncontrolled}
            />
          </BoxedList>
        </PreferencesGroup>
        <Text variant="caption" color="dim">
          uncontrolled last change: {uncontrolled}
        </Text>
      </Section>

      <View style={{ height: 260 }} />
    </>
  );
};

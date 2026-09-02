import { ActionRow, BoxedList, Switch } from '@gnome-ui/react-native';
import { useState } from 'react';

import { Section } from '../Section';

export const BoxedListScreen = () => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);

  return (
    <>
      <Section title="Default">
        <BoxedList>
          <ActionRow
            title="Wi-Fi"
            subtitle="Home Network"
            trailing={<Switch value={wifi} onValueChange={setWifi} />}
          />
          <ActionRow
            title="Bluetooth"
            subtitle="Off"
            trailing={<Switch value={bluetooth} onValueChange={setBluetooth} />}
          />
          <ActionRow title="VPN" subtitle="Not connected" trailing={<Switch value={false} />} />
        </BoxedList>
      </Section>

      <Section title="Simple rows" description="Interactive rows with no trailing accessory">
        <BoxedList>
          {['About', 'System', 'Users', 'Date & Time'].map((label) => (
            <ActionRow key={label} title={label} interactive onPress={() => {}} />
          ))}
        </BoxedList>
      </Section>

      <Section
        title="Separate variant"
        description='variant="separate" renders each row as its own standalone card'
      >
        <BoxedList variant="separate">
          <ActionRow
            title="System Settings"
            subtitle="Display, sound, power"
            interactive
            onPress={() => {}}
          />
          <ActionRow title="Wi-Fi" subtitle="Home Network" interactive onPress={() => {}} />
          <ActionRow title="Bluetooth" subtitle="Off" interactive onPress={() => {}} />
        </BoxedList>
      </Section>
    </>
  );
};

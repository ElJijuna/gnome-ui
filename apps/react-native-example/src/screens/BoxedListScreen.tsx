import { BoxedList, Switch, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Section } from '../Section';

const Row = ({
  title,
  subtitle,
  trailing,
  interactive,
}: {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  interactive?: boolean;
}) => {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body">{title}</Text>
        {subtitle && (
          <Text variant="caption" color="dim">
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </View>
  );

  return interactive ? <Pressable onPress={() => {}}>{content}</Pressable> : content;
};

export const BoxedListScreen = () => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);

  return (
    <>
      <Section title="Default">
        <BoxedList>
          <Row
            title="Wi-Fi"
            subtitle="Home Network"
            trailing={<Switch value={wifi} onValueChange={setWifi} />}
          />
          <Row
            title="Bluetooth"
            subtitle="Off"
            trailing={<Switch value={bluetooth} onValueChange={setBluetooth} />}
          />
          <Row title="VPN" subtitle="Not connected" trailing={<Switch value={false} />} />
        </BoxedList>
      </Section>

      <Section title="Simple rows" description="Interactive rows with no trailing accessory">
        <BoxedList>
          {['About', 'System', 'Users', 'Date & Time'].map((label) => (
            <Row key={label} title={label} interactive />
          ))}
        </BoxedList>
      </Section>

      <Section
        title="Separate variant"
        description='variant="separate" renders each row as its own standalone card'
      >
        <BoxedList variant="separate">
          <Row title="System Settings" subtitle="Display, sound, power" interactive />
          <Row title="Wi-Fi" subtitle="Home Network" interactive />
          <Row title="Bluetooth" subtitle="Off" interactive />
        </BoxedList>
      </Section>
    </>
  );
};

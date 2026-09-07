import {
  ActionRow,
  BoxedList,
  Card,
  Clamp,
  Switch,
  Text,
  useGnomeTheme,
} from '@gnome-ui/react-native';
import { type ReactNode, useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

/**
 * Tinted, bordered box standing in for "the available width" — without it
 * a `Clamp` is invisible, since the whole point is what it *doesn't* fill.
 */
const AvailableWidth = ({ children }: { children: ReactNode }) => {
  const theme = useGnomeTheme();

  return (
    <View
      style={{
        backgroundColor: theme.cardShadeColor,
        borderColor: theme.borderSubtle,
        borderWidth: 1,
        borderRadius: theme.radiusMd,
        padding: 12,
      }}
    >
      {children}
    </View>
  );
};

export const ClampScreen = () => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airplane, setAirplane] = useState(false);

  return (
    <>
      <Section title="Unclamped" description="A plain card fills every bit of the available width">
        <AvailableWidth>
          <Card>
            <Text>No Clamp around this card</Text>
          </Card>
        </AvailableWidth>
      </Section>

      <Section
        title="Clamped"
        description="maximumSize=240 — capped and centered inside the same box"
      >
        <AvailableWidth>
          <Clamp maximumSize={240}>
            <Card>
              <Text>maximumSize = 240</Text>
            </Card>
          </Clamp>
        </AvailableWidth>
      </Section>

      <Section
        title="Tightening threshold"
        description="Below maximumSize the clamp uses this fraction of the width"
      >
        <AvailableWidth>
          <View style={{ gap: 12 }}>
            <Clamp maximumSize={600} tighteningThreshold={0.9}>
              <Card>
                <Text>0.9 — a comfortable margin</Text>
              </Card>
            </Clamp>
            <Clamp maximumSize={600} tighteningThreshold={0.6}>
              <Card>
                <Text>0.6</Text>
              </Card>
            </Clamp>
          </View>
        </AvailableWidth>
      </Section>

      <Section
        title="Settings page"
        description="The real use — readable width for a preferences list"
      >
        <AvailableWidth>
          <Clamp maximumSize={280}>
            <BoxedList>
              <ActionRow
                title="Wi-Fi"
                subtitle="Home Network"
                trailing={
                  <Switch value={wifi} onValueChange={setWifi} accessibilityLabel="Wi-Fi" />
                }
              />
              <ActionRow
                title="Bluetooth"
                trailing={
                  <Switch
                    value={bluetooth}
                    onValueChange={setBluetooth}
                    accessibilityLabel="Bluetooth"
                  />
                }
              />
              <ActionRow
                title="Airplane Mode"
                trailing={
                  <Switch
                    value={airplane}
                    onValueChange={setAirplane}
                    accessibilityLabel="Airplane mode"
                  />
                }
              />
            </BoxedList>
          </Clamp>
        </AvailableWidth>
      </Section>
    </>
  );
};

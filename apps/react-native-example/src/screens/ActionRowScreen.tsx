import { ActionRow, BoxedList, Switch, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const ActionRowScreen = () => {
  const [notifications, setNotifications] = useState(true);

  return (
    <>
      <Section title="Default">
        <BoxedList>
          <ActionRow
            title="Notifications"
            subtitle="Show alerts and badges"
            trailing={<Switch value={notifications} onValueChange={setNotifications} />}
          />
        </BoxedList>
      </Section>

      <Section title="Leading icon" description="Rendered as-is — size/color it yourself">
        <BoxedList>
          <ActionRow
            title="Battery"
            subtitle="87%"
            leading={
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#3584e4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14 }}>⚡</Text>
              </View>
            }
          />
        </BoxedList>
      </Section>

      <Section
        title="Interactive"
        description="Renders as Pressable with accessibilityRole=&quot;button&quot;"
      >
        <BoxedList>
          <ActionRow title="About This PC" interactive onPress={() => {}} />
        </BoxedList>
      </Section>

      <Section
        title="Property variant"
        description="Flips the hierarchy: subtitle becomes the prominent value"
      >
        <BoxedList>
          <ActionRow title="OS Version" subtitle="GNOME 50" variant="property" />
          <ActionRow title="Hostname" subtitle="fedora-workstation" variant="property" />
        </BoxedList>
      </Section>

      <Section title="Disabled interactive">
        <BoxedList>
          <ActionRow title="Reset Settings" interactive disabled onPress={() => {}} />
        </BoxedList>
      </Section>
    </>
  );
};

import { ActionRow, BoxedList, ExpanderRow, Switch, Text } from '@gnome-ui/react-native';
import { useState } from 'react';

import { Section } from '../Section';

export const ExpanderRowScreen = () => {
  const [notifications, setNotifications] = useState(true);

  return (
    <>
      <Section title="Uncontrolled" description="Tap the header to reveal nested rows">
        <BoxedList>
          <ExpanderRow title="Advanced" subtitle="Proxy, DNS, and MTU settings">
            <ActionRow title="Proxy" subtitle="Automatic" />
            <ActionRow title="DNS" subtitle="Automatic" />
            <ActionRow title="MTU" subtitle="1500" />
          </ExpanderRow>
        </BoxedList>
      </Section>

      <Section
        title="With trailing widget"
        description="Stop propagation so the toggle isn't triggered"
      >
        <BoxedList>
          <ExpanderRow
            title="Notifications"
            trailing={<Switch value={notifications} onValueChange={setNotifications} />}
            defaultExpanded
          >
            <ActionRow title="Sound" subtitle="Default" />
            <ActionRow title="Badges" subtitle="On" />
          </ExpanderRow>
        </BoxedList>
      </Section>

      <Section title="Nested ButtonRow" description="Any row-shaped element works as a child">
        <BoxedList>
          <ExpanderRow title="Danger zone">
            <ActionRow title="Reset settings" />
            <Text style={{ padding: 12 }}>Custom row content also works.</Text>
          </ExpanderRow>
        </BoxedList>
      </Section>
    </>
  );
};

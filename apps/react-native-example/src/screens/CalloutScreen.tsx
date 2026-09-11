import { Callout } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const CalloutScreen = () => {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Section title="Variants" description="Contained, tinted box — sits inline with content">
        <View style={{ gap: 12 }}>
          <Callout variant="info">
            You can change your accent color at any time from Settings.
          </Callout>
          <Callout variant="warning">
            This field is optional, but recommended for account recovery.
          </Callout>
          <Callout variant="tip">Tip: press and hold a row to reveal more actions.</Callout>
        </View>
      </Section>

      <Section title="Dismissible" description="Shows a × button at the trailing edge">
        {visible ? (
          <Callout variant="info" dismissible onDismiss={() => setVisible(false)}>
            Dismiss me to see the empty state below.
          </Callout>
        ) : (
          <Callout variant="tip">Dismissed! Reopen this screen to reset.</Callout>
        )}
      </Section>

      <View style={{ height: 200 }} />
    </>
  );
};

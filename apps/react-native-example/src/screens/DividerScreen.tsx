import { InsertLink } from '@gnome-ui/icons';
import { Button, Divider, Icon, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const DividerScreen = () => {
  return (
    <>
      <Section title="No label" description="Functionally equivalent to a horizontal Separator">
        <Divider />
      </Section>

      <Section title="With a label" description="Common auth/login-form pattern">
        <View style={{ gap: 16 }}>
          <Button variant="suggested">Sign in with email</Button>
          <Divider>OR</Divider>
          <Button variant="flat">Continue with Google</Button>
        </View>
      </Section>

      <Section title="Non-string label">
        <Divider>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon icon={InsertLink} size="sm" />
            <Text variant="caption" color="dim">
              Reference
            </Text>
          </View>
        </Divider>
      </Section>
    </>
  );
};

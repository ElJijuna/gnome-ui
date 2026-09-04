import { Avatar, Badge, Button } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const BadgeScreen = () => {
  return (
    <>
      <Section title="Variants">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Badge variant="accent">1</Badge>
          <Badge variant="success">2</Badge>
          <Badge variant="warning">3</Badge>
          <Badge variant="error">4</Badge>
          <Badge variant="neutral">5</Badge>
        </View>
      </Section>

      <Section title="Dot">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Badge dot variant="success" />
          <Badge dot variant="error" />
          <Badge dot variant="neutral" />
        </View>
      </Section>

      <Section title="Longer text" description="Keep to 1–3 characters">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Badge variant="accent">99+</Badge>
          <Badge variant="warning">NEW</Badge>
        </View>
      </Section>

      <Section title="Anchored on another element" description="Top-right corner overlay">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Badge anchor={<Avatar name="Alice Bob" size="lg" />} variant="error">
            3
          </Badge>
          <Badge anchor={<Button variant="flat">Inbox</Button>} dot variant="accent" />
        </View>
      </Section>
    </>
  );
};

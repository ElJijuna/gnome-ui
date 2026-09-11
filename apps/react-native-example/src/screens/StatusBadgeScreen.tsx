import { StatusBadge } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const StatusBadgeScreen = () => {
  return (
    <Section title="Variants" description="Short, human-readable state labels">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <StatusBadge variant="success">published</StatusBadge>
        <StatusBadge variant="warning">beta</StatusBadge>
        <StatusBadge variant="error">failed</StatusBadge>
        <StatusBadge variant="new">new</StatusBadge>
        <StatusBadge variant="accent">featured</StatusBadge>
        <StatusBadge variant="neutral">draft</StatusBadge>
      </View>
    </Section>
  );
};

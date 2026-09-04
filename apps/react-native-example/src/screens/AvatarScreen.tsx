import { Avatar, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const AvatarScreen = () => {
  return (
    <>
      <Section title="Sizes" description="sm, md, lg, xl">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name="Alice Bob" size="sm" />
          <Avatar name="Alice Bob" size="md" />
          <Avatar name="Alice Bob" size="lg" />
          <Avatar name="Alice Bob" size="xl" />
        </View>
      </Section>

      <Section title="Initials from name" description="One or two words, deterministic color">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Avatar name="Ada" size="lg" />
          <Avatar name="John Doe" size="lg" />
          <Avatar name="Grace Hopper" size="lg" />
          <Avatar name="Margaret Hamilton" size="lg" />
          <Avatar name="Katherine Johnson" size="lg" />
        </View>
      </Section>

      <Section title="Explicit color override">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Avatar name="AA" color="blue" size="lg" />
          <Avatar name="AA" color="green" size="lg" />
          <Avatar name="AA" color="yellow" size="lg" />
          <Avatar name="AA" color="orange" size="lg" />
          <Avatar name="AA" color="red" size="lg" />
          <Avatar name="AA" color="purple" size="lg" />
          <Avatar name="AA" color="brown" size="lg" />
          <Avatar name="AA" color="teal" size="lg" />
          <Avatar name="AA" color="slate" size="lg" />
        </View>
      </Section>

      <Section title="Image">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar src="https://i.pravatar.cc/128?img=12" alt="Sample profile photo" size="lg" />
          <Text variant="caption" color="dim" style={{ flexShrink: 1 }}>
            Image fills the circle with `resizeMode=&quot;cover&quot;`
          </Text>
        </View>
      </Section>

      <Section title="No name, no image" description='Falls back to a plain "Avatar" label'>
        <Avatar size="lg" />
      </Section>
    </>
  );
};

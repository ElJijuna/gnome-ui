import { AvatarGroup } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

const team = [
  { name: 'Alice Martin' },
  { name: 'Bob Smith' },
  { name: 'Carol White' },
  { name: 'David Brown' },
  { name: 'Eva Green' },
];

export const AvatarGroupScreen = () => {
  return (
    <>
      <Section title="Basic" description="Under the default max (5) — no overflow chip">
        <AvatarGroup avatars={team.slice(0, 3)} />
      </Section>

      <Section title="Overflow" description="Excess avatars collapse into a +N chip">
        <AvatarGroup avatars={team} max={3} />
      </Section>

      <Section title="Sizes">
        <View style={{ gap: 16 }}>
          <AvatarGroup avatars={team} max={3} size="sm" />
          <AvatarGroup avatars={team} max={3} size="md" />
          <AvatarGroup avatars={team} max={3} size="lg" />
          <AvatarGroup avatars={team} max={3} size="xl" />
        </View>
      </Section>

      <Section title="Custom colors">
        <AvatarGroup
          avatars={[
            { name: 'Alice Martin', color: 'blue' },
            { name: 'Bob Smith', color: 'green' },
            { name: 'Carol White', color: 'purple' },
          ]}
        />
      </Section>
    </>
  );
};

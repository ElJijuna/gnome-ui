import { AvatarRotator } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const photos = [
  'https://picsum.photos/seed/gnome-ui-1/128',
  'https://picsum.photos/seed/gnome-ui-2/128',
  'https://picsum.photos/seed/gnome-ui-3/128',
];

export const AvatarRotatorScreen = () => {
  const [index, setIndex] = useState(0);

  return (
    <>
      <Section title="Basic" description="Crossfades every 3s by default">
        <AvatarRotator name="Alice Martin" avatars={photos} size="xl" />
      </Section>

      <Section title="No sources" description="Falls back to the plain Avatar initials">
        <AvatarRotator name="Bob Smith" size="xl" />
      </Section>

      <Section title="Fast interval" description="Press and hold to pause rotation">
        <AvatarRotator name="Carol White" avatars={photos} interval={800} size="xl" />
      </Section>

      <Section title="Controlled" description={`Externally active index: ${index}`}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <AvatarRotator
            name="David Brown"
            avatars={photos}
            activeIndex={index}
            onIndexChange={setIndex}
            size="xl"
          />
        </View>
      </Section>
    </>
  );
};

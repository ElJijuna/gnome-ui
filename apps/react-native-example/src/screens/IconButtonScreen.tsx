import { Heart, Search, Settings } from '@gnome-ui/icons';
import { IconButton } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const IconButtonScreen = () => {
  return (
    <>
      <Section title="Variants">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <IconButton icon={Search} label="Search" variant="default" />
          <IconButton icon={Search} label="Search" variant="suggested" />
          <IconButton icon={Search} label="Search" variant="destructive" />
          <IconButton icon={Search} label="Search" variant="flat" />
        </View>
      </Section>

      <Section title="Sizes">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton icon={Settings} label="Settings" size="sm" />
          <IconButton icon={Settings} label="Settings" size="md" />
          <IconButton icon={Settings} label="Settings" size="lg" />
        </View>
      </Section>

      <Section title="OSD" description="Dark overlay style for media controls">
        <View style={{ backgroundColor: '#111', padding: 16, borderRadius: 12 }}>
          <IconButton icon={Heart} label="Favorite" variant="osd" />
        </View>
      </Section>

      <Section title="With tooltip" description="Long-press to reveal">
        <IconButton icon={Heart} label="Favorite" tooltip="Add to favorites" />
      </Section>

      <Section title="Disabled">
        <IconButton icon={Search} label="Search" disabled />
      </Section>
    </>
  );
};

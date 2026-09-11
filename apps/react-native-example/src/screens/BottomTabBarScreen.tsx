import { Heart, Person, Search, Settings } from '@gnome-ui/icons';
import { BottomTabBar, type BottomTabBarItem, BoxedList, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const ITEMS: BottomTabBarItem[] = [
  { value: 'home', label: 'Home', icon: Search },
  { value: 'favorites', label: 'Favorites', icon: Heart, badge: true },
  { value: 'profile', label: 'Profile', icon: Person, badge: 4 },
  { value: 'settings', label: 'Settings', icon: Settings, disabled: true },
];

export const BottomTabBarScreen = () => {
  const [tab, setTab] = useState('home');

  return (
    <>
      <Section
        title="Fixed bottom navigation"
        description="Active tab is tinted with the app's configured accent color"
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <View style={{ padding: 16, gap: 8 }}>
            <Text variant="title-3">{`Selected: ${tab}`}</Text>
            <Text variant="caption" color="dim">
              Screen content would render here, above the bar.
            </Text>
          </View>
          <BottomTabBar items={ITEMS} value={tab} onChange={setTab} />
        </View>
      </Section>

      <Section title="Notes" description="">
        <BoxedList>
          <View style={{ padding: 12 }}>
            <Text>
              {
                'Pass your own useSafeAreaInsets().bottom as bottomInset when this bar sits at the true screen edge.'
              }
            </Text>
          </View>
        </BoxedList>
      </Section>
    </>
  );
};

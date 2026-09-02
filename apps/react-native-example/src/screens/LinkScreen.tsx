import { Link, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const LinkScreen = () => {
  const [visited, setVisited] = useState(false);

  return (
    <>
      <Section title="Internal">
        <Link href="/about">Go to About</Link>
      </Section>

      <Section title="External" description="Opens via Linking.openURL, with an ↗ indicator">
        <Link href="https://developer.gnome.org/hig/" external>
          GNOME Human Interface Guidelines
        </Link>
      </Section>

      <Section title="Custom onPress" description="Overrides Linking.openURL entirely">
        <View style={{ gap: 8 }}>
          <Link href="/settings" onPress={() => setVisited(true)}>
            Open Settings
          </Link>
          {visited && <Text color="accent">Navigated to Settings ✓</Text>}
        </View>
      </Section>

      <Section
        title="Multiple links"
        description="Link is Pressable-based, not Text-based — unlike the web anchor, it can't nest inline inside a paragraph of Text on native"
      >
        <View style={{ gap: 8 }}>
          <Link href="https://gnome-ui.org/">gnome-ui docs</Link>
          <Link href="https://github.com/ElJijuna/gnome-ui" external>
            Source on GitHub
          </Link>
        </View>
      </Section>
    </>
  );
};

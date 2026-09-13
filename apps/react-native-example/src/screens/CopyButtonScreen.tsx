import { CopyButton, Text, useGnomeTheme } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const CopyButtonScreen = () => {
  const theme = useGnomeTheme();

  return (
    <>
      <Section title="Default" description="Tap to copy — swaps to a checkmark for 2s">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space2 }}>
          <Text variant="monospace">CVE-2024-3094</Text>
          <CopyButton value="CVE-2024-3094" />
        </View>
      </Section>

      <Section
        title="Custom labels"
        description="label / copiedLabel override the tooltip and a11y name"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space2 }}>
          <Text variant="monospace">npm install @gnome-ui/react-native</Text>
          <CopyButton
            value="npm install @gnome-ui/react-native"
            label="Copy install command"
            copiedLabel="Added to clipboard"
          />
        </View>
      </Section>

      <Section title="Variants" description="Forwards IconButton props (variant, size)">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space3 }}>
          <CopyButton value="flat" variant="flat" />
          <CopyButton value="small" size="sm" />
          <CopyButton value="large" size="lg" />
        </View>
      </Section>

      <Section title="OSD" description="Dark overlay style for media controls">
        <View
          style={{ backgroundColor: '#111', padding: theme.space4, borderRadius: theme.radiusMd }}
        >
          <CopyButton value="osd" variant="osd" />
        </View>
      </Section>
    </>
  );
};

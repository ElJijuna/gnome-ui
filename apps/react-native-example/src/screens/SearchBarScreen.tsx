import { SearchBar, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const SearchBarScreen = () => {
  const [basic, setBasic] = useState('');
  const [closable, setClosable] = useState('');
  const [open, setOpen] = useState(true);
  const [withChips, setWithChips] = useState('');

  return (
    <>
      <Section title="Basic">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <SearchBar open value={basic} onChangeText={setBasic} onClear={() => setBasic('')} />
        </View>
      </Section>

      <Section
        title="With close button"
        description="RN's touch-first stand-in for Escape-to-close"
      >
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <SearchBar
            open
            value={closable}
            onChangeText={setClosable}
            onClear={() => setClosable('')}
            onClose={() => setClosable('')}
          />
        </View>
      </Section>

      <Section title="Collapsible" description="open={false} renders nothing at all">
        <View style={{ gap: 8 }}>
          <Text
            color="accent"
            onPress={() => setOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityLabel="Toggle search"
          >
            {open ? 'Hide search' : 'Show search'}
          </Text>
          <View style={{ borderRadius: 8, overflow: 'hidden' }}>
            <SearchBar
              open={open}
              value=""
              onClose={() => setOpen(false)}
              placeholder="Search settings…"
            />
          </View>
        </View>
      </Section>

      <Section title="With a filter row" description="Arbitrary children render below the bar">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <SearchBar open value={withChips} onChangeText={setWithChips}>
            <Text variant="caption" color="dim">
              Apps
            </Text>
            <Text variant="caption" color="dim">
              Documents
            </Text>
            <Text variant="caption" color="dim">
              Settings
            </Text>
          </SearchBar>
        </View>
      </Section>

      <Section title="Inline" description="No header-bar background — blends into the surface">
        <SearchBar open value="" inline placeholder="Filter list…" />
      </Section>

      <Section title="Disabled">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <SearchBar open value="" editable={false} placeholder="Search unavailable" />
        </View>
      </Section>
    </>
  );
};

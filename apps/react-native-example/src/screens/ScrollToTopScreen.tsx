import { ScrollToTop, Text, useGnomeTheme } from '@gnome-ui/react-native';
import { useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ScrollView, View } from 'react-native';

import { Section } from '../Section';

const POSITIONS = [
  'bottom-right',
  'bottom-left',
  'bottom-center',
  'top-right',
  'top-left',
  'top-center',
] as const;

const LINES = Array.from(
  { length: 30 },
  (_, i) => `Line ${i + 1} — scroll down to reveal the button.`,
);

export const ScrollToTopScreen = () => {
  const theme = useGnomeTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);

  return (
    <>
      <Section title="All positions" description="Always visible, all six anchors at once">
        <View
          style={{
            height: 220,
            borderRadius: theme.radiusMd,
            borderWidth: 1,
            borderColor: theme.borderSubtle,
            backgroundColor: theme.cardBgColor,
          }}
        >
          {POSITIONS.map((position) => (
            <ScrollToTop key={position} visible="always" position={position} onPress={() => {}} />
          ))}
        </View>
      </Section>

      <Section
        title="Auto visibility"
        description="Scroll the box below past 150 dp to reveal the button"
      >
        <View style={{ height: 260 }}>
          <ScrollView
            ref={scrollRef}
            onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
              setScrollY(e.nativeEvent.contentOffset.y)
            }
            scrollEventThrottle={16}
            style={{
              borderRadius: theme.radiusMd,
              borderWidth: 1,
              borderColor: theme.borderSubtle,
            }}
            contentContainerStyle={{ padding: theme.space4, gap: theme.space2 }}
          >
            {LINES.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </ScrollView>
          <ScrollToTop
            visible="auto"
            threshold={150}
            scrollY={scrollY}
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          />
        </View>
      </Section>
    </>
  );
};

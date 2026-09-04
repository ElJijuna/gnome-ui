import { Connecting, Downloading, Recording, Syncing } from '@gnome-ui/icons';
import { AnimatedIcon, Button, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const AnimatedIconScreen = () => {
  const [playing, setPlaying] = useState(true);

  return (
    <>
      <Section title="Playing" description="Toggle to compare the static and animated frames">
        <Button variant="flat" onPress={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Play'}
        </Button>
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <AnimatedIcon icon={Syncing} label="Syncing" playing={playing} size="lg" />
            <Text variant="caption" color="dim">
              Syncing
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <AnimatedIcon
              icon={Recording}
              label="Recording"
              playing={playing}
              size="lg"
              color="red"
            />
            <Text variant="caption" color="dim">
              Recording
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <AnimatedIcon icon={Downloading} label="Downloading" playing={playing} size="lg" />
            <Text variant="caption" color="dim">
              Downloading
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <AnimatedIcon
              icon={Connecting}
              label="Connecting"
              playing={playing}
              size="lg"
              color="blue"
            />
            <Text variant="caption" color="dim">
              Connecting
            </Text>
          </View>
        </View>
      </Section>

      <Section
        title="Reduced motion"
        description="Always paused when the OS reduced-motion setting is on, regardless of playing"
      >
        <AnimatedIcon icon={Syncing} label="Syncing" size="lg" />
      </Section>
    </>
  );
};

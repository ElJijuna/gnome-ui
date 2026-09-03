import { Button, ProgressBar, Text } from '@gnome-ui/react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const ProgressBarScreen = () => {
  const [progress, setProgress] = useState(0.3);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 1 ? 0 : p + 0.1));
    }, 800);

    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Section title="Determinate" description="Fill width animates as value changes">
        <View style={{ gap: 8 }}>
          <ProgressBar value={progress} accessibilityLabel="Download progress" />
          <Text variant="caption" color="dim">
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </Section>

      <Section title="Indeterminate" description="Unknown duration — pulses left to right">
        <ProgressBar accessibilityLabel="Loading" />
      </Section>

      <Section title="Variants">
        <View style={{ gap: 12 }}>
          <ProgressBar value={0.7} variant="accent" />
          <ProgressBar value={0.9} variant="success" />
          <ProgressBar value={0.5} variant="warning" />
          <ProgressBar value={0.25} variant="error" />
        </View>
      </Section>

      <Section title="Manual control">
        <View style={{ gap: 8 }}>
          <ProgressBar value={progress} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button variant="flat" onPress={() => setProgress((p) => Math.max(0, p - 0.2))}>
              -20%
            </Button>
            <Button variant="flat" onPress={() => setProgress((p) => Math.min(1, p + 0.2))}>
              +20%
            </Button>
          </View>
        </View>
      </Section>
    </>
  );
};

import { Text, type TextColor, type TextVariant } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

const VARIANTS: TextVariant[] = [
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'title-4',
  'heading',
  'body',
  'document',
  'caption',
  'caption-heading',
  'monospace',
  'numeric',
];

const COLORS: TextColor[] = [
  'default',
  'dim',
  'accent',
  'destructive',
  'success',
  'warning',
  'error',
];

export const TextScreen = () => {
  return (
    <>
      <Section title="Variants">
        <View style={{ gap: 8 }}>
          {VARIANTS.map((variant) => (
            <View key={variant} style={{ gap: 2 }}>
              <Text variant={variant}>{variant}</Text>
              <Text variant="caption" color="dim">
                {variant}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Colors">
        <View style={{ gap: 8 }}>
          {COLORS.map((color) => (
            <Text key={color} color={color}>
              {`color="${color}"`}
            </Text>
          ))}
        </View>
      </Section>

      <Section title="Numeric alignment" description="Tabular figures keep columns aligned">
        <View>
          <Text variant="numeric">1,024.50</Text>
          <Text variant="numeric">98.00</Text>
        </View>
      </Section>
    </>
  );
};

import { Text } from '@gnome-ui/react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

export interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** One labeled group of live examples on a component demo screen. */
export const Section = ({ title, description, children }: SectionProps) => {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 2 }}>
        <Text variant="heading">{title}</Text>
        {description && (
          <Text variant="caption" color="dim">
            {description}
          </Text>
        )}
      </View>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
};

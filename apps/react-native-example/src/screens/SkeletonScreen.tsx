import { Skeleton, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const SkeletonScreen = () => {
  return (
    <>
      <Section title="Rect">
        <View style={{ gap: 8 }}>
          <Skeleton />
          <Skeleton width={220} height={16} />
          <Skeleton width={140} height={16} />
        </View>
      </Section>

      <Section title="Circle">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton variant="circle" size={32} />
          <Skeleton variant="circle" size={48} />
          <Skeleton variant="circle" size={64} />
        </View>
      </Section>

      <Section title="Text" description="Last line renders narrower">
        <Skeleton variant="text" lines={4} />
      </Section>

      <Section title="Card-shaped placeholder" description="Composed from circle + text + rect">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton variant="circle" size={40} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton variant="text" lines={2} />
          </View>
        </View>
      </Section>

      <Section title="Not animated">
        <View style={{ gap: 8 }}>
          <Skeleton animated={false} />
          <Text variant="caption" color="dim">
            animated=&#123;false&#125; — static, no pulse
          </Text>
        </View>
      </Section>
    </>
  );
};

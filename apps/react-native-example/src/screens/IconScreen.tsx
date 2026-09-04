import { Add, Check, Close, Delete, Edit, Search } from '@gnome-ui/icons';
import { Icon, type IconColor, type IconSize, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

const COLORS: IconColor[] = [
  'default',
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'brown',
];

const SIZES: IconSize[] = ['sm', 'md', 'lg'];

export const IconScreen = () => {
  return (
    <>
      <Section title="Icons" description="A sample of @gnome-ui/icons">
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Icon icon={Search} label="Search" />
          <Icon icon={Add} label="Add" />
          <Icon icon={Edit} label="Edit" />
          <Icon icon={Delete} label="Delete" />
          <Icon icon={Close} label="Close" />
          <Icon icon={Check} label="Check" />
        </View>
      </Section>

      <Section title="Sizes" description="sm (12px), md (16px, default), lg (20px)">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {SIZES.map((size) => (
            <View key={size} style={{ alignItems: 'center', gap: 4 }}>
              <Icon icon={Search} label={`Search, ${size}`} size={size} />
              <Text variant="caption" color="dim">
                {size}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Palette colors" description="Named GNOME palette hues via the color prop">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {COLORS.map((color) => (
            <View key={color} style={{ alignItems: 'center', gap: 4 }}>
              <Icon icon={Search} label={`Search, ${color}`} color={color} size="lg" />
              <Text variant="caption" color="dim">
                {color}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Raw path" description="A plain { path } object, e.g. from simple-icons">
        <Icon
          icon={{ path: 'M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21 7.5 13.5 2 9h7z' }}
          label="Star"
        />
      </Section>
    </>
  );
};

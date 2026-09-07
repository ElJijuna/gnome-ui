import { Star } from '@gnome-ui/icons';
import { Button, Chip, Text, useGnomeTheme, WrapBox } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const TAGS = [
  'react',
  'react-native',
  'typescript',
  'gnome',
  'adwaita',
  'design-system',
  'accessibility',
  'monorepo',
];

const FILTERS = ['All', 'Popular', 'Recently updated', 'Deprecated', 'Has types'];

/** Tinted block of a fixed width, so wrapping and alignment are visible. */
const Item = ({ width, height }: { width: number; height?: number }) => {
  const theme = useGnomeTheme();

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: theme.cardShadeColor,
        borderRadius: theme.radiusSm,
      }}
    />
  );
};

export const WrapBoxScreen = () => {
  const theme = useGnomeTheme();
  const [removed, setRemoved] = useState<string[]>([]);
  const [filter, setFilter] = useState('All');

  const surface = {
    backgroundColor: theme.cardShadeColor,
    borderRadius: theme.radiusSm,
    padding: 6,
  };

  return (
    <>
      <Section title="Tag list" description="The canonical use — WrapBox + Chip">
        <WrapBox>
          {TAGS.filter((tag) => !removed.includes(tag)).map((tag) => (
            <Chip key={tag} label={tag} onRemove={() => setRemoved((r) => [...r, tag])} />
          ))}
        </WrapBox>
        {removed.length > 0 && (
          <Button variant="flat" onPress={() => setRemoved([])}>
            Restore removed
          </Button>
        )}
      </Section>

      <Section title="Filter row" description="Selectable chips that reflow as they wrap">
        <WrapBox childSpacing={6}>
          {FILTERS.map((value) => (
            <Chip
              key={value}
              label={value}
              icon={value === 'Popular' ? Star : undefined}
              selectable
              selected={filter === value}
              onToggle={() => setFilter(value)}
            />
          ))}
        </WrapBox>
      </Section>

      <Section
        title="childSpacing vs lineSpacing"
        description="Tight between items, loose between lines"
      >
        <WrapBox childSpacing={3} lineSpacing={24} style={surface}>
          {[92, 64, 120, 80, 108, 72, 96].map((width, index) => (
            <Item key={`${width}-${index}`} width={width} height={28} />
          ))}
        </WrapBox>
      </Section>

      <Section title="justify" description="Distribution within each line">
        {(['start', 'center', 'end', 'space-between'] as const).map((value) => (
          <View key={value} style={{ gap: 3 }}>
            <Text variant="caption" color="dim">
              {value}
            </Text>
            <WrapBox justify={value} style={surface}>
              {[96, 72, 120, 64].map((width, index) => (
                <Item key={`${width}-${index}`} width={width} height={24} />
              ))}
            </WrapBox>
          </View>
        ))}
      </Section>

      <Section title="align" description="Cross-axis alignment of items on the same line">
        {(['start', 'center', 'end', 'stretch'] as const).map((value) => (
          <View key={value} style={{ gap: 3 }}>
            <Text variant="caption" color="dim">
              {value}
            </Text>
            <WrapBox align={value} style={{ ...surface, height: 64 }}>
              {/* stretch only takes effect on items with no fixed cross-size */}
              <Item width={72} height={value === 'stretch' ? undefined : 16} />
              <Item width={72} height={value === 'stretch' ? undefined : 32} />
              <Item width={72} height={value === 'stretch' ? undefined : 48} />
            </WrapBox>
          </View>
        ))}
      </Section>

      <Section
        title="wrapReverse"
        description="Same items, same order — the lines themselves stack bottom to top"
      >
        <View style={{ gap: 3 }}>
          <Text variant="caption" color="dim">
            default
          </Text>
          <WrapBox style={surface}>
            {TAGS.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </WrapBox>
        </View>
        <View style={{ gap: 3 }}>
          <Text variant="caption" color="dim">
            wrapReverse
          </Text>
          <WrapBox wrapReverse style={surface}>
            {TAGS.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </WrapBox>
        </View>
      </Section>
    </>
  );
};

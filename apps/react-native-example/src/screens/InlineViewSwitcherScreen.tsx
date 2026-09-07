import { Applications, Folder, Star, ViewSidebar } from '@gnome-ui/icons';
import { InlineViewSwitcher, InlineViewSwitcherItem, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const VARIANTS = ['default', 'flat', 'round', 'pill'] as const;

export const InlineViewSwitcherScreen = () => {
  const [byVariant, setByVariant] = useState<Record<string, string>>({
    default: 'grid',
    flat: 'grid',
    round: 'grid',
    pill: 'grid',
  });
  const [scroll, setScroll] = useState('top');
  const [compact, setCompact] = useState('popularity');
  const [menu, setMenu] = useState('quality');

  return (
    <>
      <Section title="Variants" description="default, flat, round, pill">
        {VARIANTS.map((variant) => (
          <View key={variant} style={{ gap: 4, alignItems: 'flex-start' }}>
            <Text variant="caption" color="dim">
              {variant}
            </Text>
            <InlineViewSwitcher
              variant={variant}
              value={byVariant[variant] ?? 'grid'}
              onValueChange={(value) => setByVariant((prev) => ({ ...prev, [variant]: value }))}
              accessibilityLabel={`${variant} view`}
            >
              <InlineViewSwitcherItem name="grid" label="Grid" icon={Applications} />
              <InlineViewSwitcherItem name="list" label="List" icon={ViewSidebar} />
              <InlineViewSwitcherItem name="files" label="Files" icon={Folder} />
            </InlineViewSwitcher>
          </View>
        ))}
      </Section>

      <Section title='overflow="scroll"' description="Swipe sideways — each item snaps to the edge">
        <InlineViewSwitcher
          variant="pill"
          overflow="scroll"
          value={scroll}
          onValueChange={setScroll}
          accessibilityLabel="Ranking"
        >
          <InlineViewSwitcherItem name="top" label="Top packages" icon={Applications} />
          <InlineViewSwitcherItem name="popularity" label="Popularity" icon={Star} />
          <InlineViewSwitcherItem name="quality" label="Quality" icon={Applications} />
          <InlineViewSwitcherItem name="maintenance" label="Maintenance" icon={ViewSidebar} />
        </InlineViewSwitcher>
      </Section>

      <Section
        title='overflow="compact"'
        description="Too narrow for the labels, so they collapse to icons"
      >
        <InlineViewSwitcher
          overflow="compact"
          value={compact}
          onValueChange={setCompact}
          accessibilityLabel="Ranking"
        >
          <InlineViewSwitcherItem name="top" label="Top packages" icon={Applications} />
          <InlineViewSwitcherItem name="popularity" label="Popularity" icon={Star} />
          <InlineViewSwitcherItem name="quality" label="Quality" icon={Applications} />
          <InlineViewSwitcherItem name="maintenance" label="Maintenance" icon={ViewSidebar} />
        </InlineViewSwitcher>
      </Section>

      <Section
        title='overflow="menu"'
        description="Collapses to the active item — tap to pick from a BottomSheet"
      >
        <InlineViewSwitcher
          variant="round"
          overflow="menu"
          value={menu}
          onValueChange={setMenu}
          accessibilityLabel="Ranking"
        >
          <InlineViewSwitcherItem name="top" label="Top packages" icon={Applications} />
          <InlineViewSwitcherItem name="popularity" label="Popularity" icon={Star} />
          <InlineViewSwitcherItem name="quality" label="Quality" icon={Applications} />
          <InlineViewSwitcherItem name="maintenance" label="Maintenance" icon={ViewSidebar} />
        </InlineViewSwitcher>
      </Section>
    </>
  );
};

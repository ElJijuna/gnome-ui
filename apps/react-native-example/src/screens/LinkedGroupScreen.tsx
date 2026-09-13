import { FormatJustifyCenter, FormatJustifyLeft, FormatJustifyRight } from '@gnome-ui/icons';
import { Button, IconButton, LinkedGroup, useGnomeTheme } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const LinkedGroupScreen = () => {
  const theme = useGnomeTheme();

  return (
    <>
      <Section
        title="Buttons"
        description="Segmented row with merged borders, no gap — default variant has a visible border to merge"
      >
        <LinkedGroup>
          <Button>Cut</Button>
          <Button>Copy</Button>
          <Button>Paste</Button>
        </LinkedGroup>
      </Section>

      <Section title="Icon buttons" description="Common alignment-toggle pattern">
        <LinkedGroup>
          <IconButton icon={FormatJustifyLeft} label="Align left" />
          <IconButton icon={FormatJustifyCenter} label="Align center" />
          <IconButton icon={FormatJustifyRight} label="Align right" />
        </LinkedGroup>
      </Section>

      <Section title="Vertical" description="Stacked instead of side by side">
        <View style={{ alignItems: 'flex-start' }}>
          <LinkedGroup vertical>
            <Button>Top</Button>
            <Button>Middle</Button>
            <Button>Bottom</Button>
          </LinkedGroup>
        </View>
      </Section>

      <Section title="Custom style" description="style forwards to the outer row/column">
        <LinkedGroup style={{ backgroundColor: theme.cardBgColor, padding: theme.space1 }}>
          <Button variant="raised">Save</Button>
          <Button variant="raised">Save As…</Button>
        </LinkedGroup>
      </Section>
    </>
  );
};

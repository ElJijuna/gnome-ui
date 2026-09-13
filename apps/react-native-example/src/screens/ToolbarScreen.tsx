import { Add, GoPrevious, Search, Settings } from '@gnome-ui/icons';
import { Button, IconButton, Spacer, Toolbar, useGnomeTheme } from '@gnome-ui/react-native';

import { Section } from '../Section';

export const ToolbarScreen = () => {
  const theme = useGnomeTheme();

  return (
    <>
      <Section title="Flat buttons" description="Standard row of flat icon buttons">
        <Toolbar style={{ backgroundColor: theme.cardBgColor, borderRadius: theme.radiusMd }}>
          <IconButton icon={GoPrevious} label="Back" variant="flat" />
          <IconButton icon={Search} label="Search" variant="flat" />
          <IconButton icon={Settings} label="Settings" variant="flat" />
        </Toolbar>
      </Section>

      <Section title="With Spacer" description="Pushes trailing items to the end">
        <Toolbar style={{ backgroundColor: theme.cardBgColor, borderRadius: theme.radiusMd }}>
          <Button variant="flat">Cancel</Button>
          <Spacer />
          <Button variant="flat">Done</Button>
        </Toolbar>
      </Section>

      <Section title="Raised action" description="A raised button for explicit elevation">
        <Toolbar style={{ backgroundColor: theme.cardBgColor, borderRadius: theme.radiusMd }}>
          <IconButton icon={GoPrevious} label="Back" variant="flat" />
          <Spacer />
          <IconButton icon={Add} label="Add" variant="raised" />
        </Toolbar>
      </Section>
    </>
  );
};

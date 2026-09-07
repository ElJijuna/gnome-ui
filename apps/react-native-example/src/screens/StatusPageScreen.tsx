import { Add, NetworkOffline, Search, StarOutline } from '@gnome-ui/icons';
import { Button, Card, Icon, StatusPage, useGnomeTheme } from '@gnome-ui/react-native';
import { Text as RNText, View } from 'react-native';

import { Section } from '../Section';

export const StatusPageScreen = () => {
  const theme = useGnomeTheme();

  const surface = {
    backgroundColor: theme.cardShadeColor,
    borderRadius: theme.radiusMd,
  };

  return (
    <>
      <Section title="Empty state" description="Icon, title, description, and one clear action">
        <View style={surface}>
          <StatusPage
            icon={StarOutline}
            title="No favorites yet"
            description="Packages you star will show up here, ready to compare at a glance."
          >
            <Button variant="suggested" leadingIcon={<Icon icon={Add} size="sm" />}>
              Add a package
            </Button>
          </StatusPage>
        </View>
      </Section>

      <Section title="Two actions" description="The action area wraps when it runs out of room">
        <View style={surface}>
          <StatusPage
            icon={NetworkOffline}
            title="Connection lost"
            description="Check your network and try again."
          >
            <Button variant="suggested">Retry now</Button>
            <Button variant="flat">Work offline</Button>
          </StatusPage>
        </View>
      </Section>

      <Section title="Compact" description="For sidebars, popovers, and small panels">
        <Card>
          <StatusPage
            compact
            icon={Search}
            title="No results"
            description="Try a different search term."
          >
            <Button variant="flat">Clear filters</Button>
          </StatusPage>
        </Card>
      </Section>

      <Section title="Text only" description="No icon, no actions">
        <View style={surface}>
          <StatusPage title="All done" description="Everything is up to date." />
        </View>
      </Section>

      <Section title="Custom iconNode" description="An emoji or image instead of a GNOME icon">
        <View style={surface}>
          <StatusPage
            iconNode={<RNText style={{ fontSize: 96 }}>🎉</RNText>}
            title="Nice work"
            description="You reviewed every package on your list."
          />
        </View>
      </Section>
    </>
  );
};

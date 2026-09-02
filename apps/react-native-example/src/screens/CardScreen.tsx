import { Button, Card, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const CardScreen = () => {
  return (
    <>
      <Section title="Default">
        <Card>
          <Text variant="heading">Card title</Text>
          <Text variant="body" color="dim" style={{ marginTop: 4 }}>
            This is a static card that groups related content on an elevated surface.
          </Text>
        </Card>
      </Section>

      <Section
        title="Interactive"
        description="Renders as Pressable with accessibilityRole=&quot;button&quot;"
      >
        <Card interactive onPress={() => {}}>
          <Text variant="heading">Clickable card</Text>
          <Text variant="body" color="dim" style={{ marginTop: 4 }}>
            Press to see the activatable overlay tint.
          </Text>
        </Card>
      </Section>

      <Section title="Padding sizes">
        <View style={{ gap: 12 }}>
          {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
            <Card key={padding} padding={padding}>
              <Text variant="caption-heading" color="dim">
                padding=&quot;{padding}&quot;
              </Text>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="With action">
        <Card>
          <Text variant="heading">Storage almost full</Text>
          <Text variant="body" color="dim" style={{ marginTop: 4, marginBottom: 16 }}>
            You have used 18.3 GB of your 20 GB quota. Free up space to continue syncing files.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="flat">Later</Button>
            <Button variant="suggested">Manage Storage</Button>
          </View>
        </Card>
      </Section>

      <Section title="Disabled interactive">
        <Card interactive disabled onPress={() => {}}>
          <Text variant="heading">Disabled card</Text>
          <Text variant="body" color="dim" style={{ marginTop: 4 }}>
            Cannot be pressed.
          </Text>
        </Card>
      </Section>
    </>
  );
};

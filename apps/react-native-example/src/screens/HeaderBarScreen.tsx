import { Button, HeaderBar, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const HeaderBarScreen = () => {
  return (
    <>
      <Section title="Default">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <HeaderBar
            title="Files"
            start={
              <Button variant="flat" size="sm" shape="circular">
                {'‹'}
              </Button>
            }
            end={
              <Button variant="flat" size="sm" shape="circular">
                {'+'}
              </Button>
            }
          />
        </View>
      </Section>

      <Section title="Flat" description="Blends into the window chrome — no bottom border">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <HeaderBar
            flat
            title="Settings"
            start={
              <Button variant="flat" size="sm">
                {'Cancel'}
              </Button>
            }
            end={
              <Button variant="flat" size="sm">
                {'Done'}
              </Button>
            }
          />
        </View>
      </Section>

      <Section title="No title" description="Only leading/trailing controls">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <HeaderBar
            start={
              <Button variant="flat" size="sm" shape="circular">
                {'☰'}
              </Button>
            }
            end={
              <>
                <Button variant="flat" size="sm" shape="circular">
                  {'🔍'}
                </Button>
                <Button variant="flat" size="sm" shape="circular">
                  {'⋮'}
                </Button>
              </>
            }
          />
        </View>
      </Section>

      <Section title="Custom title node">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <HeaderBar
            title={
              <View style={{ alignItems: 'center' }}>
                <Text variant="heading">Downloads</Text>
                <Text variant="caption" color="dim">
                  3 items
                </Text>
              </View>
            }
          />
        </View>
      </Section>
    </>
  );
};

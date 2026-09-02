import { TabBar, TabItem, TabPanel, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const PANEL_CONTENT: Record<string, string> = {
  general: 'General settings live here.',
  advanced: 'Advanced settings live here.',
  network: 'Network settings live here.',
};

export const TabsScreen = () => {
  const [active, setActive] = useState('general');
  const [closeableTabs, setCloseableTabs] = useState(['Document 1', 'Document 2', 'Document 3']);

  return (
    <>
      <Section title="Default">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <TabBar accessibilityLabel="Settings sections">
            <TabItem
              label="General"
              active={active === 'general'}
              onPress={() => setActive('general')}
            />
            <TabItem
              label="Advanced"
              active={active === 'advanced'}
              onPress={() => setActive('advanced')}
            />
            <TabItem
              label="Network"
              active={active === 'network'}
              onPress={() => setActive('network')}
            />
          </TabBar>
          <View style={{ padding: 16 }}>
            {Object.entries(PANEL_CONTENT).map(([key, content]) => (
              <TabPanel key={key} active={active === key}>
                <Text>{content}</Text>
              </TabPanel>
            ))}
          </View>
        </View>
      </Section>

      <Section title="With icons and badges">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <TabBar accessibilityLabel="Mail folders">
            <TabItem label="Inbox" icon={<Text>📥</Text>} active count={5} onPress={() => {}} />
            <TabItem label="Sent" icon={<Text>📤</Text>} onPress={() => {}} />
            <TabItem label="Spam" icon={<Text>⚠️</Text>} count={150} onPress={() => {}} />
          </TabBar>
        </View>
      </Section>

      <Section title="Closeable" description="Each tab can be individually closed">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <TabBar accessibilityLabel="Open documents">
            {closeableTabs.map((label, index) => (
              <TabItem
                key={label}
                label={label}
                active={index === 0}
                onPress={() => {}}
                onClose={() => setCloseableTabs((tabs) => tabs.filter((t) => t !== label))}
              />
            ))}
          </TabBar>
        </View>
      </Section>

      <Section
        title="Inline"
        description="Blends into the surrounding surface — no background/border"
      >
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <TabBar inline accessibilityLabel="Inline example">
            <TabItem label="Overview" active onPress={() => {}} />
            <TabItem label="Details" onPress={() => {}} />
          </TabBar>
        </View>
      </Section>

      <Section title="Disabled tab">
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <TabBar accessibilityLabel="Disabled example">
            <TabItem label="Available" active onPress={() => {}} />
            <TabItem label="Coming Soon" disabled onPress={() => {}} />
          </TabBar>
        </View>
      </Section>
    </>
  );
};

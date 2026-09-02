import { HeaderBar, Text, ViewSwitcher, ViewSwitcherItem } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const ViewSwitcherScreen = () => {
  const [view, setView] = useState('all');
  const [tab, setTab] = useState('grid');

  return (
    <>
      <Section title="Default">
        <ViewSwitcher accessibilityLabel="Library views">
          {['all', 'photos', 'shared'].map((v) => (
            <ViewSwitcherItem key={v} label={v} active={view === v} onPress={() => setView(v)} />
          ))}
        </ViewSwitcher>
      </Section>

      <Section title="With icons">
        <ViewSwitcher accessibilityLabel="Layout">
          <ViewSwitcherItem
            label="Grid"
            icon={<Text>▦</Text>}
            active={tab === 'grid'}
            onPress={() => setTab('grid')}
          />
          <ViewSwitcherItem
            label="List"
            icon={<Text>☰</Text>}
            active={tab === 'list'}
            onPress={() => setTab('list')}
          />
        </ViewSwitcher>
      </Section>

      <Section title="Disabled item">
        <ViewSwitcher accessibilityLabel="Disabled example">
          <ViewSwitcherItem label="Available" active onPress={() => {}} />
          <ViewSwitcherItem label="Locked" disabled onPress={() => {}} />
        </ViewSwitcher>
      </Section>

      <Section
        title="As a HeaderBar title"
        description="The canonical GNOME pattern — README calls this out explicitly"
      >
        <View style={{ borderRadius: 8, overflow: 'hidden' }}>
          <HeaderBar
            title={
              <ViewSwitcher accessibilityLabel="Header views">
                <ViewSwitcherItem label="Read" active onPress={() => {}} />
                <ViewSwitcherItem label="Unread" onPress={() => {}} />
              </ViewSwitcher>
            }
          />
        </View>
      </Section>
    </>
  );
};

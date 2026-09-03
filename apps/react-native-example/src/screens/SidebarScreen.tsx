import { Sidebar, SidebarItem, SidebarSection, Text, TextField } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const SidebarScreen = () => {
  const [active, setActive] = useState('inbox');
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState('');

  return (
    <>
      <Section title="Sections and items">
        <View style={{ height: 320, flexDirection: 'row', borderRadius: 8, overflow: 'hidden' }}>
          <Sidebar>
            <SidebarSection title="Mailboxes">
              <SidebarItem
                label="Inbox"
                icon={<Text>📥</Text>}
                active={active === 'inbox'}
                onPress={() => setActive('inbox')}
              />
              <SidebarItem
                label="Starred"
                icon={<Text>⭐</Text>}
                active={active === 'starred'}
                onPress={() => setActive('starred')}
                suffix={<Text variant="caption">3</Text>}
              />
              <SidebarItem
                label="Sent"
                icon={<Text>📤</Text>}
                active={active === 'sent'}
                onPress={() => setActive('sent')}
              />
            </SidebarSection>
            <SidebarSection title="Labels" collapsible>
              <SidebarItem
                label="Work"
                active={active === 'work'}
                onPress={() => setActive('work')}
              />
              <SidebarItem
                label="Personal"
                active={active === 'personal'}
                onPress={() => setActive('personal')}
              />
              <SidebarItem label="Archived" disabled />
            </SidebarSection>
          </Sidebar>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text color="dim">{active}</Text>
          </View>
        </View>
      </Section>

      <Section
        title="Collapsed (rail) mode"
        description="Tap a row to toggle — labels hide, icons center"
      >
        <View style={{ height: 220, flexDirection: 'row', borderRadius: 8, overflow: 'hidden' }}>
          <Sidebar collapsed={collapsed}>
            <SidebarItem
              label="Home"
              icon={<Text>🏠</Text>}
              active
              onPress={() => setCollapsed((c) => !c)}
            />
            <SidebarItem label="Search" icon={<Text>🔍</Text>} onPress={() => {}} />
            <SidebarItem label="Settings" icon={<Text>⚙️</Text>} onPress={() => {}} />
          </Sidebar>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text color="dim">Tap "Home" to toggle collapsed</Text>
          </View>
        </View>
      </Section>

      <Section title="Filtered" description="Controlled filter — pair with your own search input">
        <View style={{ gap: 8 }}>
          <TextField
            placeholder="Filter fruit…"
            value={filter}
            onChangeText={setFilter}
            autoCapitalize="none"
          />
          <View style={{ height: 180, borderRadius: 8, overflow: 'hidden' }}>
            <Sidebar filter={filter}>
              <SidebarItem label="Apples" onPress={() => {}} />
              <SidebarItem label="Bananas" onPress={() => {}} />
              <SidebarItem label="Cherries" onPress={() => {}} />
            </Sidebar>
          </View>
        </View>
      </Section>
    </>
  );
};

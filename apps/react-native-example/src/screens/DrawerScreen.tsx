import { Information, Person, Settings } from '@gnome-ui/icons';
import {
  ActionRow,
  BoxedList,
  Button,
  Drawer,
  type DrawerRailItem,
  Text,
} from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const RailDemo = () => {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<'general' | 'account' | 'about'>('general');

  const sections: Record<typeof section, { title: string; body: string }> = {
    general: { title: 'General', body: 'General preferences go here.' },
    account: { title: 'Account', body: 'Account details go here.' },
    about: { title: 'About', body: 'App version and credits go here.' },
  };

  const rail: DrawerRailItem[] = [
    {
      id: 'general',
      icon: Settings,
      label: 'General',
      active: section === 'general',
      onPress: () => setSection('general'),
    },
    {
      id: 'account',
      icon: Person,
      label: 'Account',
      active: section === 'account',
      onPress: () => setSection('account'),
    },
    {
      id: 'about',
      icon: Information,
      label: 'About',
      active: section === 'about',
      onPress: () => setSection('about'),
    },
  ];

  return (
    <>
      <Button onPress={() => setOpen(true)}>Open Settings</Button>
      <Drawer open={open} title={sections[section].title} onClose={() => setOpen(false)} rail={rail}>
        <Text variant="body" color="dim">
          {sections[section].body}
        </Text>
      </Drawer>
    </>
  );
};

const NestedDemo = () => {
  const [parentOpen, setParentOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setParentOpen(true)}>Open Parent</Button>
      <Drawer open={parentOpen} title="Parent" onClose={() => setParentOpen(false)}>
        <View style={{ gap: 12 }}>
          <Text color="dim">Opening a drawer from here is automatically narrower.</Text>
          <Button variant="flat" onPress={() => setChildOpen(true)}>
            Open Child
          </Button>
        </View>
        <Drawer open={childOpen} title="Child" onClose={() => setChildOpen(false)}>
          <Text color="dim">This drawer scaled its own width down (0.85×).</Text>
        </Drawer>
      </Drawer>
    </>
  );
};

export const DrawerScreen = () => {
  const [rightOpen, setRightOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);

  return (
    <>
      <Section title="Basic" description="Slides in from the right by default">
        <Button onPress={() => setRightOpen(true)}>Open Drawer</Button>
        <Drawer open={rightOpen} title="Details" onClose={() => setRightOpen(false)}>
          <Text color="dim">Drawer content can be any React node passed as children.</Text>
        </Drawer>
      </Section>

      <Section title="Left side, wide, content prop">
        <Button onPress={() => setLeftOpen(true)}>Show Filters</Button>
        <Drawer
          open={leftOpen}
          side="left"
          size="wide"
          title="Filters"
          onClose={() => setLeftOpen(false)}
          content={
            <BoxedList>
              <ActionRow interactive title="All files" onPress={() => setLeftOpen(false)} />
              <ActionRow interactive title="Images" onPress={() => setLeftOpen(false)} />
              <ActionRow interactive title="Documents" onPress={() => setLeftOpen(false)} />
            </BoxedList>
          }
        />
      </Section>

      <Section title="With rail" description="Switch panels without closing the drawer">
        <RailDemo />
      </Section>

      <Section title="Nested drawers" description="Each level scales its width down">
        <NestedDemo />
      </Section>
    </>
  );
};

import { Information, Person, Settings } from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { ActionRow } from '@/components/ActionRow';
import { BoxedList } from '@/components/BoxedList';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';

import { Drawer, type DrawerRailItem } from './Drawer';
import readme from './README.md?raw';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    open: { control: 'boolean' },
    side: { control: 'inline-radio', options: ['left', 'right'] },
    size: { control: 'inline-radio', options: ['classic', 'wide'] },
    title: { control: 'text' },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: {
    open: false,
    side: 'right',
    size: 'classic',
    title: 'Details',
    closeOnBackdrop: true,
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <Text variant="body" color="dim">
            Drawer content can be any React node passed as children.
          </Text>
        </Drawer>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

export const NestedDrawers: Story = {
  render: () => {
    const [firstOpen, setFirstOpen] = useState(false);
    const [secondOpen, setSecondOpen] = useState(false);
    const [thirdOpen, setThirdOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setFirstOpen(true)}>Open Drawer</Button>
        <Drawer open={firstOpen} title="Project" onClose={() => setFirstOpen(false)}>
          <Text variant="body" color="dim">
            Each drawer opened from inside another drawer automatically renders narrower than its
            parent.
          </Text>
          <Button onClick={() => setSecondOpen(true)}>Open Task Drawer</Button>
          <Drawer open={secondOpen} title="Task" onClose={() => setSecondOpen(false)}>
            <Text variant="body" color="dim">
              This drawer is nested one level deep.
            </Text>
            <Button onClick={() => setThirdOpen(true)}>Open Comment Drawer</Button>
            <Drawer open={thirdOpen} title="Comment" onClose={() => setThirdOpen(false)}>
              <Text variant="body" color="dim">
                This drawer is nested two levels deep — narrower still.
              </Text>
            </Drawer>
          </Drawer>
        </Drawer>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

export const WithRail: Story = {
  render: () => {
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
        onClick: () => setSection('general'),
      },
      {
        id: 'account',
        icon: Person,
        label: 'Account',
        active: section === 'account',
        onClick: () => setSection('account'),
      },
      {
        id: 'about',
        icon: Information,
        label: 'About',
        active: section === 'about',
        onClick: () => setSection('about'),
      },
    ];

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Settings</Button>
        <Drawer
          open={open}
          title={sections[section].title}
          onClose={() => setOpen(false)}
          rail={rail}
        >
          <Text variant="body" color="dim">
            {sections[section].body}
          </Text>
        </Drawer>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

export const LeftContentProp: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Filters</Button>
        <Drawer
          open={open}
          side="left"
          size="wide"
          title="Filters"
          onClose={() => setOpen(false)}
          content={
            <BoxedList>
              <ActionRow title="All files" onClick={() => setOpen(false)} />
              <ActionRow title="Images" onClick={() => setOpen(false)} />
              <ActionRow title="Documents" onClick={() => setOpen(false)} />
            </BoxedList>
          }
        />
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

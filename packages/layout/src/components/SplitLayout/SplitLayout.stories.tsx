import { GoHome, Search, Settings, Star } from '@gnome-ui/icons';
import { Button, Sidebar, SidebarItem, Text } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import readme from './README.md?raw';
import { SplitLayout } from './SplitLayout';

const meta: Meta<typeof SplitLayout> = {
  title: 'Layout/SplitLayout',
  component: SplitLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SplitLayout>;

const items = [
  { id: 'home', label: 'Home', icon: GoHome },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const MailShell = () => {
  const [active, setActive] = useState<string | null>(null);

  const activeItem = items.find((i) => i.id === active);

  return (
    <div style={{ height: 480, border: '1px solid rgb(0 0 0 / 0.1)', borderRadius: 12 }}>
      <SplitLayout
        sidebarTitle="Mail"
        sidebar={
          <Sidebar style={{ height: '100%' }}>
            {items.map(({ id, label, icon }) => (
              <SidebarItem
                key={id}
                icon={icon}
                label={label}
                active={active === id}
                onClick={() => setActive(id)}
              />
            ))}
          </Sidebar>
        }
        detailTitle={activeItem?.label}
        detail={
          activeItem ? (
            <div style={{ padding: 24 }}>
              <Text variant="title-3">{activeItem.label}</Text>
              <Text variant="body" color="dim" style={{ marginTop: 8 }}>
                Content for the {activeItem.id} view.
              </Text>
            </div>
          ) : (
            <div style={{ padding: 24 }}>
              <Text variant="body" color="dim">
                Select an item from the list.
              </Text>
            </div>
          )
        }
        showDetail={active !== null}
        onBack={() => setActive(null)}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <MailShell />,
  parameters: { controls: { disable: true } },
};

export const NarrowViewport: Story = {
  render: () => <MailShell />,
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          'Narrow viewport (≤ 400 px): only one pane is visible at a time, and the detail ' +
          "pane's header grows an automatic Back button — no manual `showContent`/back-button " +
          'wiring required, unlike composing `NavigationSplitView` directly.',
      },
    },
  },
};

export const WithActions: Story = {
  render: () => (
    <div style={{ height: 480, border: '1px solid rgb(0 0 0 / 0.1)', borderRadius: 12 }}>
      <SplitLayout
        sidebarTitle="Mail"
        sidebarActions={<Button variant="flat">Compose</Button>}
        sidebar={<div style={{ padding: 16 }}>Message list</div>}
        detailTitle="Welcome"
        detailActions={<Button variant="flat">Delete</Button>}
        detail={<div style={{ padding: 24 }}>Select a message to read it.</div>}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

import {
  Add,
  Delete,
  GoHome,
  HelpBrowser,
  MediaPlay,
  Search,
  Settings,
  Star,
} from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { HeaderBar } from '@/components/HeaderBar';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import readme from './README.md?raw';
import { ViewSwitcherSidebar } from './ViewSwitcherSidebar';
import { ViewSwitcherSidebarItem } from './ViewSwitcherSidebarItem';

const meta: Meta<typeof ViewSwitcherSidebar> = {
  title: 'Components/ViewSwitcherSidebar',
  component: ViewSwitcherSidebar,
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
type Story = StoryObj<typeof ViewSwitcherSidebar>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [view, setView] = useState('home');

    return (
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <ViewSwitcherSidebar value={view} onValueChange={setView} style={{ height: 280 }}>
          <ViewSwitcherSidebarItem name="home" label="Home" icon={GoHome} />
          <ViewSwitcherSidebarItem name="starred" label="Starred" icon={Star} />
          <ViewSwitcherSidebarItem name="search" label="Search" icon={Search} />
          <ViewSwitcherSidebarItem name="settings" label="Settings" icon={Settings} />
        </ViewSwitcherSidebar>
        <Text variant="body" color="dim" style={{ paddingTop: 12 }}>
          Active: <strong>{view}</strong>
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With counts ──────────────────────────────────────────────────────────────

export const WithCounts: Story = {
  render: function WithCountsStory() {
    const [view, setView] = useState('inbox');

    return (
      <ViewSwitcherSidebar value={view} onValueChange={setView} style={{ height: 280 }}>
        <ViewSwitcherSidebarItem name="inbox" label="Inbox" icon={GoHome} count={12} />
        <ViewSwitcherSidebarItem name="drafts" label="Drafts" icon={Add} count={3} />
        <ViewSwitcherSidebarItem name="sent" label="Sent" icon={Star} />
        <ViewSwitcherSidebarItem name="trash" label="Trash" icon={Delete} count={104} />
      </ViewSwitcherSidebar>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With suffix ──────────────────────────────────────────────────────────────

export const WithSuffix: Story = {
  render: function WithSuffixStory() {
    const [view, setView] = useState('music');

    return (
      <ViewSwitcherSidebar value={view} onValueChange={setView} style={{ height: 280 }}>
        <ViewSwitcherSidebarItem
          name="music"
          label="Music"
          icon={MediaPlay}
          suffix={<Badge variant="accent">New</Badge>}
        />
        <ViewSwitcherSidebarItem name="podcasts" label="Podcasts" icon={Star} />
        <ViewSwitcherSidebarItem name="radio" label="Radio" icon={Search} />
        <ViewSwitcherSidebarItem name="settings" label="Settings" icon={Settings} />
      </ViewSwitcherSidebar>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Prefix / suffix ──────────────────────────────────────────────────────────

export const PrefixAndSuffix: Story = {
  render: function PrefixAndSuffixStory() {
    const [view, setView] = useState('inbox');
    const [collapsed, setCollapsed] = useState(false);

    return (
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <ViewSwitcherSidebar
          value={view}
          onValueChange={setView}
          collapsed={collapsed}
          style={{ height: 360 }}
          prefix={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
              <Avatar name="Ada Lovelace" size="sm" />
              {!collapsed && (
                <div style={{ minWidth: 0 }}>
                  <Text variant="heading" style={{ display: 'block' }}>
                    Ada Lovelace
                  </Text>
                  <Text variant="caption" color="dim" style={{ display: 'block' }}>
                    ada@example.org
                  </Text>
                </div>
              )}
            </div>
          }
          suffix={
            <div style={{ padding: 6 }}>
              <Button
                variant="flat"
                aria-label="Help"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}
              >
                <Icon icon={HelpBrowser} />
                {!collapsed && 'Help'}
              </Button>
            </div>
          }
        >
          <ViewSwitcherSidebarItem name="inbox" label="Inbox" icon={GoHome} count={12} />
          <ViewSwitcherSidebarItem name="starred" label="Starred" icon={Star} />
          <ViewSwitcherSidebarItem name="drafts" label="Drafts" icon={Add} count={3} />
          <ViewSwitcherSidebarItem name="trash" label="Trash" icon={Delete} />
        </ViewSwitcherSidebar>
        <Button variant="flat" onClick={() => setCollapsed((v) => !v)} style={{ marginTop: 12 }}>
          {collapsed ? 'Expand' : 'Collapse'}
        </Button>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`prefix` and `suffix` pin content above and below the item list — here an account header and a help button. They replace the deprecated `header` / `footer` props and mirror `AdwViewSwitcherSidebar:prefix` / `:suffix` from libadwaita 1.10.',
      },
    },
  },
};

// ─── In a full layout ─────────────────────────────────────────────────────────

export const InLayout: Story = {
  render: function InLayoutStory() {
    const [view, setView] = useState('inbox');

    const content: Record<string, string> = {
      inbox: 'Your inbox — 12 unread messages.',
      drafts: '3 unsent drafts.',
      sent: 'Messages you have sent.',
      trash: 'Deleted messages. They will be purged after 30 days.',
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 12,
          overflow: 'hidden',
          height: 420,
          maxWidth: 680,
        }}
      >
        <HeaderBar title="Mail" />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ViewSwitcherSidebar value={view} onValueChange={setView} style={{ height: '100%' }}>
            <ViewSwitcherSidebarItem name="inbox" label="Inbox" icon={GoHome} count={12} />
            <ViewSwitcherSidebarItem name="drafts" label="Drafts" icon={Add} count={3} />
            <ViewSwitcherSidebarItem name="sent" label="Sent" icon={Star} />
            <ViewSwitcherSidebarItem name="trash" label="Trash" icon={Delete} />
          </ViewSwitcherSidebar>
          <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
            <Text variant="title-3" style={{ textTransform: 'capitalize' }}>
              {view}
            </Text>
            <Text variant="body" color="dim" style={{ marginTop: 8 }}>
              {content[view]}
            </Text>
          </main>
        </div>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

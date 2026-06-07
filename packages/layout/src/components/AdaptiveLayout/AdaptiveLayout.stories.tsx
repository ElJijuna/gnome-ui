import {
  Applications,
  Document,
  Folder,
  GoHome,
  Search,
  Settings,
  Share,
  Star,
} from '@gnome-ui/icons';
import { Avatar, Box, Button, HeaderBar, Icon, Text, WrapBox } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { UserCard } from '../UserCard';

import type { AdaptiveNavItem, GnomeColor, GnomeColorShade } from './AdaptiveLayout';
import { AdaptiveLayout } from './AdaptiveLayout';
import readme from './README.md?raw';

const meta: Meta<typeof AdaptiveLayout> = {
  title: 'Adaptive/AdaptiveLayout',
  component: AdaptiveLayout,
  tags: ['autodocs'],
  argTypes: {
    sidebarPlacement: {
      control: 'radio',
      options: ['inline', 'full'],
      description:
        '"inline": top bar spans full width, sidebar below it. "full": sidebar spans full height on the left, top bar + content on the right.',
    },
    showHeaderSeparator: {
      control: 'boolean',
      description: 'Show the separator line below the sidebar header slot.',
    },
    showFooterSeparator: {
      control: 'boolean',
      description: 'Show the separator line above the sidebar footer slot.',
    },
    showCollapseButtonSeparator: {
      control: 'boolean',
      description: 'Show the separator line between sidebarFooter content and the collapse button.',
    },
    bgColor: {
      control: 'select',
      options: ['white', 'blue', 'green', 'yellow', 'orange', 'red', 'purple', 'brown'],
      description: 'Background color from the gnome palette',
    },
    bgShade: {
      control: { type: 'range', min: 1, max: 5, step: 1 },
      description: 'Shade of the background color (1 = lightest, 5 = darkest)',
    },
    bgOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Opacity of the background color (0–1)',
    },
    glass: {
      control: 'boolean',
      description:
        'Enables the frosted-glass effect: semitransparent backgrounds + backdrop blur. Requires a background behind the layout.',
    },
  },
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
type Story = StoryObj<typeof AdaptiveLayout>;

// ─── Shared data ──────────────────────────────────────────────────────────────

const items: AdaptiveNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: GoHome },
  { id: 'following', label: 'Following', icon: Star, badge: 5 },
  { id: 'my-apps', label: 'My Apps', icon: Applications, badge: 3, group: 'Develop' },
  { id: 'api-docs', label: 'API Docs', icon: Document, group: 'Develop' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const overflowItems: AdaptiveNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: GoHome, badge: 2 },
  { id: 'following', label: 'Following', icon: Star, badge: 5 },
  { id: 'starred', label: 'Starred', icon: Search },
  { id: 'files', label: 'Files', icon: Folder },
  { id: 'share', label: 'Share', icon: Share },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [active, setActive] = useState('dashboard');
    const activeItem = items.find((i) => i.id === active);

    return (
      <AdaptiveLayout
        items={items}
        value={active}
        onValueChange={setActive}
        topBar={<HeaderBar title="Developer Portal" />}
        sidebarHeader={
          <UserCard
            name="El Jijuna"
            email="Developer"
            orientation="horizontal"
            avatarColor="red"
            avatarSize="md"
          />
        }
        sidebarHeaderCollapsed={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <Avatar name="El Jijuna" color="red" size="md" />
          </div>
        }
      >
        <p
          style={{
            fontFamily: 'var(--gnome-font-family)',
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: '0 0 8px',
          }}
        >
          {activeItem?.label}
        </p>
        <p style={{ fontFamily: 'var(--gnome-font-family)', opacity: 0.6, margin: 0 }}>
          Resize the viewport using the toolbar to see Mobile, Tablet, and Desktop layouts.
        </p>
      </AdaptiveLayout>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Grouped items (Develop section), badges, and a user card in the sidebar header. Resize via the viewport toolbar to switch between Mobile / Tablet / Desktop.',
      },
    },
  },
};

export const MobileOverflow: Story = {
  render: function OverflowStory() {
    const [active, setActive] = useState('dashboard');
    const activeItem = overflowItems.find((i) => i.id === active);

    return (
      <AdaptiveLayout
        items={overflowItems}
        value={active}
        onValueChange={setActive}
        topBar={<HeaderBar title="My App" />}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--gnome-font-family)',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 8px',
            }}
          >
            {activeItem?.label}
          </p>
          <p style={{ fontFamily: 'var(--gnome-font-family)', opacity: 0.6, margin: 0 }}>
            6 items on mobile: first 3 visible, rest accessible via the <strong>More</strong>{' '}
            button.
          </p>
        </div>
      </AdaptiveLayout>
    );
  },
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: 'iphonexr' },
    docs: {
      description: {
        story:
          '6 ungrouped items on mobile: the first 3 appear in the bar, the rest open via a **More** BottomSheet. If the active item is in the overflow group, More renders in its active state.',
      },
    },
  },
};

export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [active, setActive] = useState('dashboard');
    const activeItem = items.find((i) => i.id === active);

    return (
      <AdaptiveLayout
        {...args}
        items={items}
        value={active}
        onValueChange={setActive}
        topBar={<HeaderBar title="Developer Portal" />}
        sidebarHeader={
          <Box orientation="horizontal" justify="space-between" align="center" padding={6}>
            <Box orientation="horizontal" align="center" style={{ flexGrow: 1 }}>
              <Avatar name="Application" color="red" size="md" />
              <Text>App Name</Text>
            </Box>
            <Button shape="circular" size="sm">
              <Icon icon={Settings} size="sm" />
            </Button>
          </Box>
        }
        sidebarHeaderCollapsed={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <Avatar name="El Jijuna" color="red" size="md" />
          </div>
        }
        sidebarFooter={
          <UserCard
            name="El Jijuna"
            email="pilmee@gmail.com"
            orientation="horizontal"
            avatarColor="red"
            avatarSize="md"
          />
        }
        sidebarFooterCollapsed={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
            <Avatar name="El Jijuna" color="red" size="md" />
          </div>
        }
        footer={
          <WrapBox justify="space-between">
            <Text color="dim" variant="caption">
              © 2025 My Company
            </Text>
            <WrapBox>
              <Button variant="flat" size="sm">
                Privacy
              </Button>
              <Button variant="flat" size="sm">
                Terms
              </Button>
            </WrapBox>
          </WrapBox>
        }
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--gnome-font-family)',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 8px',
            }}
          >
            {activeItem?.label}
          </p>
          <p style={{ fontFamily: 'var(--gnome-font-family)', opacity: 0.6, margin: 0 }}>
            Use the <strong>Controls</strong> panel to try all props live.
          </p>
        </div>
      </AdaptiveLayout>
    );
  },
  args: {
    sidebarPlacement: 'inline',
    showHeaderSeparator: true,
    showFooterSeparator: true,
    showCollapseButtonSeparator: false,
    showCollapseButton: true,
    bgColor: 'white' as GnomeColor,
    bgShade: 3 as GnomeColorShade,
    bgOpacity: 1,
    glass: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — use the **Controls** panel to experiment with all props: `sidebarPlacement`, `sidebarSeparators`, `showCollapseButton`, `bgColor`, `bgShade`, `bgOpacity`, and `glass`.',
      },
    },
  },
};

export const SidebarFull: Story = {
  render: function SidebarFullStory() {
    const [active, setActive] = useState('dashboard');
    const activeItem = items.find((i) => i.id === active);

    return (
      <AdaptiveLayout
        items={items}
        value={active}
        onValueChange={setActive}
        sidebarPlacement="full"
        topBar={<HeaderBar title="Developer Portal" />}
        sidebarHeader={
          <UserCard
            name="El Jijuna"
            email="Developer"
            orientation="horizontal"
            avatarColor="red"
            avatarSize="md"
          />
        }
        sidebarHeaderCollapsed={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <Avatar name="El Jijuna" color="red" size="md" />
          </div>
        }
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--gnome-font-family)',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 8px',
            }}
          >
            {activeItem?.label}
          </p>
          <p style={{ fontFamily: 'var(--gnome-font-family)', opacity: 0.6, margin: 0 }}>
            <code>sidebarPlacement="full"</code>: the sidebar spans the full height on the left, the
            top bar and content are stacked on the right.
          </p>
        </div>
      </AdaptiveLayout>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`sidebarPlacement="full"`: sidebar occupies the full left column, top bar and content are stacked to its right.',
      },
    },
  },
};

export const Glass: Story = {
  render: function GlassStory() {
    const [active, setActive] = useState('dashboard');
    const activeItem = items.find((i) => i.id === active);

    return (
      <div
        style={{
          backgroundImage: [
            'linear-gradient(135deg, rgba(53,132,228,0.45) 0%, rgba(145,65,172,0.45) 50%, rgba(230,97,0,0.45) 100%)',
            "url('https://picsum.photos/id/1067/1920/1080')",
          ].join(', '),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <AdaptiveLayout
          glass
          items={items}
          value={active}
          onValueChange={setActive}
          sidebarPlacement="full"
          topBar={<HeaderBar title="Developer Portal" />}
          sidebarHeader={
            <UserCard
              name="El Jijuna"
              email="Developer"
              orientation="horizontal"
              avatarColor="red"
              avatarSize="md"
            />
          }
          sidebarHeaderCollapsed={
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <Avatar name="El Jijuna" color="red" size="md" />
            </div>
          }
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--gnome-font-family)',
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0 0 8px',
              }}
            >
              {activeItem?.label}
            </p>
            <p style={{ fontFamily: 'var(--gnome-font-family)', opacity: 0.6, margin: 0 }}>
              The layout is frosted glass over the gradient background. Set <code>glass</code> on
              any <code>AdaptiveLayout</code> that sits on top of a wallpaper or coloured parent.
            </p>
          </div>
        </AdaptiveLayout>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`glass` prop: the layout surfaces become semitransparent and blurred, letting the parent background show through. No external CSS needed — the effect is fully self-contained.',
      },
    },
  },
};

export const WithSidebarFooter: Story = {
  render: function SidebarFooterStory() {
    const [active, setActive] = useState('dashboard');
    const activeItem = items.find((i) => i.id === active);

    return (
      <AdaptiveLayout
        items={items}
        value={active}
        onValueChange={setActive}
        topBar={<HeaderBar title="Developer Portal" />}
        sidebarPlacement="full"
        sidebarHeader={<Avatar name="Application" color="red" size="md" />}
        sidebarFooter={
          <UserCard
            name="El Jijuna"
            email="pilmee@gmail.com"
            orientation="horizontal"
            avatarColor="red"
            avatarSize="md"
          />
        }
        sidebarFooterCollapsed={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
            <Avatar name="El Jijuna" color="red" size="md" />
          </div>
        }
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--gnome-font-family)',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 8px',
            }}
          >
            {activeItem?.label}
          </p>
          <p style={{ fontFamily: 'var(--gnome-font-family)', opacity: 0.6, margin: 0 }}>
            The user card lives in <code>sidebarFooter</code>, above the collapse button. Resize to
            tablet to see the avatar-only collapsed version.
          </p>
        </div>
      </AdaptiveLayout>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'User identity in `sidebarFooter`: full `UserCard` when expanded, avatar-only via `sidebarFooterCollapsed` when collapsed. The collapse button stays pinned below.',
      },
    },
  },
};

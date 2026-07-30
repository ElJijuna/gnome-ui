import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './badge';

interface BadgeArgs {
  anchored: boolean;
  content: string;
  dot: boolean;
  variant: 'accent' | 'error' | 'neutral' | 'success' | 'warning';
}

function renderBadge(args: BadgeArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.flexDirection = 'row';
  demo.style.alignItems = 'center';
  demo.style.gap = 'var(--gnome-space-3, 18px)';

  const badge = document.createElement('gnome-badge');
  badge.variant = args.variant;
  badge.dot = args.dot;
  badge.textContent = args.content;

  if (args.anchored) {
    const wrapper = document.createElement('span');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-flex';

    const anchor = document.createElement('span');
    anchor.textContent = '🔔';
    anchor.style.fontSize = '1.5rem';

    badge.anchored = true;
    wrapper.append(anchor, badge);
    demo.append(wrapper);
  } else {
    demo.append(badge);
  }

  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Badge',
  component: 'gnome-badge',
  tags: ['autodocs'],
  render: renderBadge,
  args: {
    anchored: false,
    content: '3',
    dot: false,
    variant: 'accent',
  },
  argTypes: {
    anchored: {
      control: 'boolean',
      description:
        'Positions the badge absolutely at the top-right of a wrapper the consumer marks position: relative.',
    },
    content: {
      control: 'text',
      description: 'Light-DOM text content. Keep to 1–3 characters.',
    },
    dot: {
      control: 'boolean',
      description: 'Small dot with no visible label — for unread/online indicators.',
    },
    variant: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'error', 'neutral'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Pure CSS counter/status indicator. variant, dot, and anchored are plain attributes read directly by CSS.',
      },
    },
  },
} satisfies Meta<BadgeArgs>;

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Interactive: Story = {};

export const Dot: Story = {
  args: {
    dot: true,
  },
};

export const Anchored: Story = {
  args: {
    anchored: true,
    content: '3',
    variant: 'error',
  },
};

export const AnchoredDot: Story = {
  args: {
    anchored: true,
    dot: true,
    variant: 'success',
  },
};

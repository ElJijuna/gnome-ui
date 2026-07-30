import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './skeleton';

interface SkeletonArgs {
  animated: boolean;
  height: string;
  lines: number;
  size: string;
  variant: 'circle' | 'rect' | 'text';
  width: string;
}

function renderSkeleton(args: SkeletonArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const skeleton = document.createElement('gnome-skeleton');
  skeleton.variant = args.variant;
  skeleton.animated = args.animated;
  skeleton.lines = args.lines;

  if (args.variant === 'circle') {
    skeleton.size = args.size;
  } else if (args.variant === 'rect') {
    skeleton.width = args.width;
    skeleton.height = args.height;
  }

  demo.append(skeleton);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Skeleton',
  component: 'gnome-skeleton',
  tags: ['autodocs'],
  render: renderSkeleton,
  args: {
    animated: true,
    height: '20',
    lines: 3,
    size: '40',
    variant: 'rect',
    width: '200',
  },
  argTypes: {
    variant: { control: 'select', options: ['rect', 'circle', 'text'] },
    width: { control: 'text', description: 'Only used by the rect variant.' },
    height: { control: 'text', description: 'Only used by the rect variant.' },
    size: { control: 'text', description: 'Diameter, only used by the circle variant.' },
    lines: {
      control: { type: 'number', min: 1, max: 8, step: 1 },
      description: 'Row count, only used by the text variant.',
    },
    animated: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Loading placeholder for content-shaped skeleton screens. Purely presentational — always aria-hidden.',
      },
    },
  },
} satisfies Meta<SkeletonArgs>;

export default meta;
type Story = StoryObj<SkeletonArgs>;

export const Rectangular: Story = {};

export const Circle: Story = {
  args: {
    variant: 'circle',
    size: '48',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    lines: 4,
  },
  render: (args) => {
    const story = renderSkeleton(args);
    const demo = story.querySelector<HTMLDivElement>('.wc-story__demo');

    if (demo) {
      demo.style.width = '320px';
    }

    return story;
  },
};

export const NotAnimated: Story = {
  name: 'Animation disabled (prefers-reduced-motion)',
  args: {
    animated: false,
  },
};

export const CardSkeleton: Story = {
  name: 'Card placeholder',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const card = document.createElement('div');
    card.style.width = '320px';
    card.style.display = 'grid';
    card.style.gap = '18px';
    card.style.padding = '16px';
    card.style.border = '1px solid var(--gnome-border-color, rgb(0 0 0 / 0.12))';
    card.style.borderRadius = 'var(--gnome-radius-md, 12px)';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '12px';

    const avatarSkeleton = document.createElement('gnome-skeleton');
    avatarSkeleton.variant = 'circle';
    avatarSkeleton.size = '44';

    const titleSkeleton = document.createElement('gnome-skeleton');
    titleSkeleton.variant = 'text';
    titleSkeleton.lines = 2;
    titleSkeleton.style.flex = '1';

    header.append(avatarSkeleton, titleSkeleton);

    const bodySkeleton = document.createElement('gnome-skeleton');
    bodySkeleton.height = '72';

    const textSkeleton = document.createElement('gnome-skeleton');
    textSkeleton.variant = 'text';
    textSkeleton.lines = 3;

    card.append(header, bodySkeleton, textSkeleton);
    demo.append(card);
    story.append(demo);

    return story;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A realistic card placeholder that mirrors avatar, title, summary, and content regions while data loads.',
      },
    },
  },
};

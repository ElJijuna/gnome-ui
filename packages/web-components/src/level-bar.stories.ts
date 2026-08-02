import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './level-bar';

interface LevelBarArgs {
  discrete: boolean;
  high?: number;
  highVariant: 'accent' | 'error' | 'success' | 'warning';
  low?: number;
  lowVariant: 'accent' | 'error' | 'success' | 'warning';
  max: number;
  min: number;
  numBlocks: number;
  value: number;
  variant: 'accent' | 'error' | 'success' | 'warning';
}

function renderLevelBar(args: LevelBarArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '260px';

  const levelBar = document.createElement('gnome-level-bar');
  levelBar.min = args.min;
  levelBar.max = args.max;
  levelBar.value = args.value;
  levelBar.variant = args.variant;
  levelBar.lowVariant = args.lowVariant;
  levelBar.highVariant = args.highVariant;
  levelBar.discrete = args.discrete;
  levelBar.numBlocks = args.numBlocks;
  levelBar.setAttribute('aria-label', 'Disk usage');

  if (args.low !== undefined) {
    levelBar.low = args.low;
  }

  if (args.high !== undefined) {
    levelBar.high = args.high;
  }

  demo.append(levelBar);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Level Bar',
  component: 'gnome-level-bar',
  tags: ['autodocs'],
  render: renderLevelBar,
  args: {
    discrete: false,
    highVariant: 'error',
    lowVariant: 'warning',
    max: 1,
    min: 0,
    numBlocks: 10,
    value: 0.4,
    variant: 'accent',
  },
  argTypes: {
    discrete: {
      control: 'boolean',
      description: 'Renders as a row of blocks instead of a continuous fill.',
    },
    high: {
      control: 'number',
      description: 'Threshold at/above which the bar switches to highVariant.',
    },
    highVariant: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'error'],
    },
    low: {
      control: 'number',
      description: 'Threshold at/below which the bar switches to lowVariant.',
    },
    lowVariant: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'error'],
    },
    max: { control: 'number' },
    min: { control: 'number' },
    numBlocks: {
      control: 'number',
      description: 'Number of blocks when discrete is true.',
    },
    value: { control: 'number' },
    variant: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'error'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Scalar measurement gauge (`role="meter"`) with colour-coded low/high offset zones — mirrors `GtkLevelBar`. Use for disk usage, battery, or signal strength, not task progress (see `gnome-progress-bar`).',
      },
    },
  },
} satisfies Meta<LevelBarArgs>;

export default meta;
type Story = StoryObj<LevelBarArgs>;

export const Interactive: Story = {};

export const LowWarning: Story = {
  args: {
    low: 0.2,
    value: 0.1,
  },
};

export const HighError: Story = {
  args: {
    high: 0.8,
    value: 0.95,
  },
};

export const Discrete: Story = {
  args: {
    discrete: true,
    numBlocks: 8,
    value: 0.625,
  },
};

export const DiscreteSignalStrength: Story = {
  args: {
    discrete: true,
    high: 0.6,
    highVariant: 'success',
    low: 0.2,
    lowVariant: 'error',
    numBlocks: 5,
    value: 0.6,
    variant: 'warning',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Signal-strength style indicator: red at low bars, yellow mid-range, green when strong.',
      },
    },
  },
};

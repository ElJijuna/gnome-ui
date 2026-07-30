import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './progress-bar';

interface ProgressBarArgs {
  indeterminate: boolean;
  value: number;
  variant: 'accent' | 'error' | 'success' | 'warning';
}

function renderProgressBar(args: ProgressBarArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const bar = document.createElement('gnome-progress-bar');
  bar.setAttribute('aria-label', 'Download progress');
  bar.variant = args.variant;

  if (!args.indeterminate) {
    bar.value = args.value;
  }

  demo.append(bar);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Progress Bar',
  component: 'gnome-progress-bar',
  tags: ['autodocs'],
  render: renderProgressBar,
  args: {
    indeterminate: false,
    value: 0.6,
    variant: 'accent',
  },
  argTypes: {
    indeterminate: {
      control: 'boolean',
      description: 'Omits the value attribute for the indeterminate pulsing state.',
    },
    value: {
      control: { type: 'range', max: 1, min: 0, step: 0.01 },
      description: 'Progress between 0 and 1. Ignored when indeterminate is true.',
    },
    variant: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'error'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Presentational determinate/indeterminate progress bar with role="progressbar". Omit value for the indeterminate pulsing state.',
      },
    },
  },
} satisfies Meta<ProgressBarArgs>;

export default meta;
type Story = StoryObj<ProgressBarArgs>;

export const Interactive: Story = {};

export const Success: Story = {
  args: {
    value: 1,
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    value: 0.85,
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    value: 0.3,
    variant: 'error',
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

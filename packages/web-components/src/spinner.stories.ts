import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './spinner';

interface SpinnerArgs {
  label: string;
  size: 'lg' | 'md' | 'sm';
}

function renderSpinner(args: SpinnerArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.flexDirection = 'row';
  demo.style.alignItems = 'center';
  demo.style.gap = 'var(--gnome-space-2, 12px)';

  const spinner = document.createElement('gnome-spinner');
  spinner.size = args.size;
  spinner.label = args.label;

  demo.append(spinner);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Spinner',
  component: 'gnome-spinner',
  tags: ['autodocs'],
  render: renderSpinner,
  args: {
    label: 'Loading…',
    size: 'md',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label. Set to an empty string to silence it for assistive tech.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Purely presentational indeterminate loading indicator with role="status" and a CSS animation that respects prefers-reduced-motion.',
      },
    },
  },
} satisfies Meta<SpinnerArgs>;

export default meta;
type Story = StoryObj<SpinnerArgs>;

export const Interactive: Story = {};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const Silenced: Story = {
  args: {
    label: '',
  },
};

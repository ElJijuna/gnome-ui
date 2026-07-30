import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './button';

interface ButtonArgs {
  disabled: boolean;
  label: string;
  loading: boolean;
  osd: boolean;
  shape: 'circular' | 'default' | 'pill';
  size: 'lg' | 'md' | 'sm';
  variant: 'default' | 'destructive' | 'flat' | 'raised' | 'suggested';
}

function renderButton(args: ButtonArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  if (args.osd) {
    demo.style.padding = '40px 24px';
    demo.style.borderRadius = '12px';
    demo.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
  }

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = 'The light-DOM button remains a native form control.';

  const form = document.createElement('form');
  const button = document.createElement('gnome-button');
  button.variant = args.variant;
  button.size = args.size;
  button.shape = args.shape;
  button.disabled = args.disabled;
  button.loading = args.loading;
  button.osd = args.osd;

  const control = document.createElement('button');
  control.type = 'submit';
  control.dataset.slot = 'button-control';
  control.textContent = args.shape === 'circular' ? '＋' : args.label;

  if (args.shape === 'circular') {
    control.setAttribute('aria-label', args.label);
  }

  button.append(control);
  form.append(button);
  demo.append(form, eventOutput);
  story.append(demo);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    eventOutput.textContent = `Submitted ${args.label}.`;
  });

  return story;
}

const meta = {
  title: 'Web Components/Button',
  component: 'gnome-button',
  tags: ['autodocs'],
  render: renderButton,
  args: {
    disabled: false,
    label: 'Save changes',
    loading: false,
    osd: false,
    shape: 'default',
    size: 'md',
    variant: 'default',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the native light-DOM button.',
    },
    label: {
      control: 'text',
      description: 'Visible label, or accessible name for circular buttons.',
    },
    loading: {
      control: 'boolean',
      description: 'Sets aria-busy, disables activation, and shows progress.',
    },
    osd: {
      control: 'boolean',
      description: 'Uses the dark overlay treatment for media.',
    },
    shape: {
      control: 'select',
      options: ['default', 'pill', 'circular'],
      description: 'Visual shape of the native control.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Control size.',
    },
    variant: {
      control: 'select',
      options: ['default', 'suggested', 'destructive', 'flat', 'raised'],
      description: 'GNOME HIG visual treatment.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Styled light-DOM wrapper that preserves native button semantics, form participation, keyboard behavior, focus, and htmx compatibility.',
      },
    },
  },
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Interactive: Story = {};

export const Suggested: Story = {
  args: {
    label: 'Apply',
    variant: 'suggested',
  },
};

export const Destructive: Story = {
  args: {
    label: 'Delete file',
    variant: 'destructive',
  },
};

export const Loading: Story = {
  args: {
    label: 'Saving',
    loading: true,
    variant: 'suggested',
  },
};

export const Circular: Story = {
  args: {
    label: 'Add item',
    shape: 'circular',
    variant: 'suggested',
  },
};

export const Osd: Story = {
  args: {
    label: 'Play',
    osd: true,
  },
};

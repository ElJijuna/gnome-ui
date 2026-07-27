import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './toast';

interface ToastArgs {
  action: boolean;
  duration: number;
  message: string;
  open: boolean;
  variant: 'default' | 'error' | 'success' | 'warning';
}

function renderToast(args: ToastArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.textContent = 'Show notification';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = 'Use the controls to test variants and timing.';

  const toast = document.createElement('gnome-toast');
  toast.duration = args.duration;
  toast.open = args.open;

  if (args.variant !== 'default') {
    toast.setAttribute('variant', args.variant);
  }

  const title = document.createElement('span');
  title.dataset.slot = 'toast-title';
  title.textContent = args.message;

  const actions = document.createElement('span');
  actions.dataset.slot = 'toast-actions';

  if (args.action) {
    const undo = document.createElement('button');
    undo.type = 'button';
    undo.dataset.action = 'undo';
    undo.textContent = 'Undo';
    actions.append(undo);
  }

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.dataset.dismiss = '';
  dismiss.setAttribute('aria-label', 'Dismiss notification');
  dismiss.textContent = '×';
  actions.append(dismiss);

  toast.append(title, actions);
  demo.append(trigger, toast, eventOutput);
  story.append(demo);

  trigger.addEventListener('click', () => toast.show());
  toast.addEventListener('gnome-action', (event) => {
    const { action } = event.detail;
    eventOutput.textContent = `Action selected: ${action}.`;
  });
  toast.addEventListener('gnome-dismiss', (event) => {
    const { reason } = event.detail;
    eventOutput.textContent = `Toast dismissed: ${reason}.`;
  });

  return story;
}

const meta = {
  title: 'Web Components/Toast',
  component: 'gnome-toast',
  tags: ['autodocs'],
  render: renderToast,
  args: {
    action: true,
    duration: 0,
    message: 'Changes saved',
    open: true,
    variant: 'success',
  },
  argTypes: {
    action: {
      control: 'boolean',
      description: 'Shows an example action that emits gnome-action.',
    },
    duration: {
      control: { min: 0, step: 500, type: 'number' },
      description: 'Auto-dismiss delay in milliseconds; zero keeps the toast open.',
    },
    message: {
      control: 'text',
      description: 'Notification content announced through the polite live region.',
    },
    open: {
      control: 'boolean',
      description: 'Reflects the open attribute.',
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'Semantic visual treatment.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Accessible live-region notification with cancelable actions, timed dismissal, and pause on hover or focus.',
      },
    },
  },
} satisfies Meta<ToastArgs>;

export default meta;
type Story = StoryObj<ToastArgs>;

export const Interactive: Story = {};

export const Timed: Story = {
  args: {
    duration: 5000,
  },
};

export const Error: Story = {
  args: {
    action: false,
    message: 'Could not save changes',
    variant: 'error',
  },
};

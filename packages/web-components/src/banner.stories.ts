import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './banner';

interface BannerArgs {
  actionLabel: string;
  dismissible: boolean;
  message: string;
  variant: 'error' | 'info' | 'success' | 'warning';
}

function renderBanner(args: BannerArgs) {
  const banner = document.createElement('gnome-banner');
  banner.variant = args.variant;

  const message = document.createElement('span');
  message.dataset.slot = 'banner-message';
  message.textContent = args.message;
  banner.append(message);

  if (args.actionLabel || args.dismissible) {
    const actions = document.createElement('span');
    actions.dataset.slot = 'banner-actions';

    if (args.actionLabel) {
      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.dataset.action = 'primary';
      actionBtn.textContent = args.actionLabel;
      actions.append(actionBtn);
    }

    if (args.dismissible) {
      const dismissBtn = document.createElement('button');
      dismissBtn.type = 'button';
      dismissBtn.dataset.dismiss = '';
      dismissBtn.setAttribute('aria-label', 'Dismiss');
      dismissBtn.textContent = '×';
      actions.append(dismissBtn);
    }

    banner.append(actions);
  }

  return banner;
}

function renderStory(args: BannerArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.maxWidth = '600px';
  demo.style.padding = '0';

  demo.append(renderBanner(args));
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Banner',
  component: 'gnome-banner',
  tags: ['autodocs'],
  render: renderStory,
  args: {
    actionLabel: '',
    dismissible: false,
    message: 'A new software update is available.',
    variant: 'info',
  },
  argTypes: {
    variant: { control: 'select', options: ['info', 'warning', 'error', 'success'] },
    message: { control: 'text' },
    actionLabel: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Persistent message strip displayed at the top of a view. Mark descendants data-action / data-dismiss; the host emits gnome-action / gnome-dismiss.',
      },
    },
  },
} satisfies Meta<BannerArgs>;

export default meta;
type Story = StoryObj<BannerArgs>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.maxWidth = '600px';
    demo.style.padding = '0';
    demo.style.gap = '2px';

    const rows: Array<[BannerArgs['variant'], string]> = [
      ['info', 'A new software update is available.'],
      ['warning', 'Your session will expire in 5 minutes.'],
      ['error', 'Failed to sync. Check your connection.'],
      ['success', 'Your changes have been saved.'],
    ];

    for (const [variant, message] of rows) {
      demo.append(renderBanner({ actionLabel: '', dismissible: false, message, variant }));
    }

    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

export const WithAction: Story = {
  args: {
    actionLabel: 'Update Now',
    message: 'A new software update is available.',
    variant: 'info',
  },
  render: (args) => {
    const story = renderStory(args);
    story
      .querySelector('[data-action]')
      ?.addEventListener('click', () => window.alert('Update started'));
    return story;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Add a <button data-action> inside [data-slot="banner-actions"] for a trailing action.',
      },
    },
  },
};

export const Dismissible: Story = {
  args: {
    dismissible: true,
    message: 'Your session will expire in 5 minutes.',
    variant: 'warning',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Add a <button data-dismiss> to let the user close the banner; it hides itself and fires gnome-dismiss.',
      },
    },
  },
};

export const WithActionAndDismiss: Story = {
  args: {
    actionLabel: 'Retry',
    dismissible: true,
    message: 'Failed to back up your files. Check your storage connection.',
    variant: 'error',
  },
  render: (args) => {
    const story = renderStory(args);
    story
      .querySelector('[data-action]')
      ?.addEventListener('click', () => window.alert('Retrying…'));
    return story;
  },
};

export const InContext: Story = {
  name: 'In context',
  args: {
    actionLabel: 'Free Up Space',
    dismissible: true,
    message: 'Storage is almost full — 18.3 GB of 20 GB used.',
    variant: 'warning',
  },
  render: (args) => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.maxWidth = '600px';
    demo.style.padding = '0';

    const frame = document.createElement('div');
    frame.style.border = '1px solid rgb(0 0 0 / 0.1)';
    frame.style.borderRadius = '12px';
    frame.style.overflow = 'hidden';

    const banner = renderBanner(args);
    banner
      .querySelector('[data-action]')
      ?.addEventListener('click', () => window.alert('Opening storage settings'));

    const content = document.createElement('div');
    content.style.padding = '24px';
    content.style.opacity = '0.5';
    content.textContent = 'View content area';

    frame.append(banner, content);
    demo.append(frame);
    story.append(demo);

    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The banner sits directly below the header bar, spanning the full width of the content area.',
      },
    },
  },
};

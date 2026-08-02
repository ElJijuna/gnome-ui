import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './icon-button';

interface IconButtonArgs {
  disabled: boolean;
  icon: 'plus' | 'trash' | 'close';
  label: string;
  loading: boolean;
  osd: boolean;
  size: 'lg' | 'md' | 'sm';
  variant: 'default' | 'destructive' | 'flat' | 'raised' | 'suggested';
}

const ICONS: Record<IconButtonArgs['icon'], string> = {
  plus: '<path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  trash:
    '<path d="M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  close: '<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" fill="none"/>',
};

function renderIconButton(args: IconButtonArgs) {
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
  eventOutput.textContent = 'The light-DOM button remains a native control.';

  const iconButton = document.createElement('gnome-icon-button');
  iconButton.variant = args.variant;
  iconButton.size = args.size;
  iconButton.disabled = args.disabled;
  iconButton.loading = args.loading;
  iconButton.osd = args.osd;
  iconButton.label = args.label;

  const control = document.createElement('button');
  control.type = 'button';
  control.dataset.slot = 'icon-button-control';
  control.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${ICONS[args.icon]}</svg>`;
  control.addEventListener('click', () => {
    eventOutput.textContent = `Activated "${args.label}".`;
  });

  iconButton.append(control);
  demo.append(iconButton, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Icon Button',
  component: 'gnome-icon-button',
  tags: ['autodocs'],
  render: renderIconButton,
  args: {
    disabled: false,
    icon: 'plus',
    label: 'Add item',
    loading: false,
    osd: false,
    size: 'md',
    variant: 'default',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the native light-DOM button.',
    },
    icon: {
      control: 'select',
      options: ['plus', 'trash', 'close'],
      description: 'Demo icon rendered inside the control (any SVG/img light-DOM child works).',
    },
    label: {
      control: 'text',
      description: 'Required accessible name — synced onto the control’s aria-label.',
    },
    loading: {
      control: 'boolean',
      description: 'Sets aria-busy, disables activation, and swaps the icon for a spinner.',
    },
    osd: {
      control: 'boolean',
      description: 'Uses the dark overlay treatment for media.',
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
          'Icon-only action button. Always circular, since there is no text to make a rectangular shape meaningful. `label` is required and is synced onto the native control’s `aria-label`.',
      },
    },
  },
} satisfies Meta<IconButtonArgs>;

export default meta;
type Story = StoryObj<IconButtonArgs>;

export const Interactive: Story = {};

export const Flat: Story = {
  args: {
    icon: 'close',
    label: 'Close panel',
    variant: 'flat',
  },
};

export const Destructive: Story = {
  args: {
    icon: 'trash',
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

export const Osd: Story = {
  args: {
    icon: 'close',
    label: 'Close player',
    osd: true,
  },
};

export const Sizes: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.alignItems = 'center';
    demo.style.gap = '12px';

    for (const size of ['sm', 'md', 'lg'] as const) {
      const iconButton = document.createElement('gnome-icon-button');
      iconButton.variant = 'suggested';
      iconButton.size = size;
      iconButton.label = `Add item (${size})`;

      const control = document.createElement('button');
      control.type = 'button';
      control.dataset.slot = 'icon-button-control';
      control.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${ICONS.plus}</svg>`;

      iconButton.append(control);
      demo.append(iconButton);
    }

    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

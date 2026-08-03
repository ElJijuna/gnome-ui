import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './copy-button';
import type { GnomeCopyButtonElement } from './copy-button';

interface CopyButtonArgs {
  value: string;
  label: string;
  copiedLabel: string;
  resetDelay: number;
  variant: 'default' | 'destructive' | 'flat' | 'raised' | 'suggested';
  size: 'lg' | 'md' | 'sm';
  disabled: boolean;
  osd: boolean;
}

function renderCopyButton(args: CopyButtonArgs) {
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
  eventOutput.textContent = 'Click the button to copy the value to your clipboard.';

  const copyButton = document.createElement('gnome-copy-button') as GnomeCopyButtonElement;
  copyButton.value = args.value;
  copyButton.label = args.label;
  copyButton.copiedLabel = args.copiedLabel;
  copyButton.resetDelay = args.resetDelay;
  copyButton.variant = args.variant;
  copyButton.size = args.size;
  copyButton.disabled = args.disabled;
  copyButton.osd = args.osd;

  copyButton.addEventListener('gnome-copied', (event) => {
    eventOutput.textContent = `Copied "${event.detail.value}" to the clipboard.`;
  });
  copyButton.addEventListener('gnome-copy-error', () => {
    eventOutput.textContent = 'Copy failed — the Clipboard API is unavailable in this context.';
  });

  demo.append(copyButton, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Copy Button',
  component: 'gnome-copy-button',
  tags: ['autodocs'],
  render: renderCopyButton,
  args: {
    value: 'CVE-2024-3094',
    label: 'Copy',
    copiedLabel: 'Copied!',
    resetDelay: 2000,
    variant: 'default',
    size: 'md',
    disabled: false,
    osd: false,
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The text copied to the clipboard when the button is activated.',
    },
    label: {
      control: 'text',
      description: 'Accessible label shown before copying. Defaults to "Copy".',
    },
    copiedLabel: {
      control: 'text',
      description: 'Accessible label shown briefly after a successful copy. Defaults to "Copied!".',
    },
    resetDelay: {
      control: 'number',
      description: 'How long the "copied" confirmation is shown, in milliseconds.',
    },
    variant: {
      control: 'select',
      options: ['default', 'suggested', 'destructive', 'flat', 'raised'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    osd: {
      control: 'boolean',
      description: 'Uses the dark overlay treatment for media.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Icon button that copies `value` to the clipboard, swapping to a checkmark and a "Copied!" label for `resetDelay` ms as confirmation. Fully host-generated — nothing for the consumer to author. Fires `gnome-copied` on success and `gnome-copy-error` if the write fails or the Clipboard API is unavailable.',
      },
    },
  },
} satisfies Meta<CopyButtonArgs>;

export default meta;
type Story = StoryObj<CopyButtonArgs>;

export const Interactive: Story = {};

export const WithCustomLabel: Story = {
  args: {
    label: 'Copy CVE ID',
  },
};

export const InlineWithIdentifier: Story = {
  render: (args) => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.alignItems = 'center';
    demo.style.gap = '4px';

    const code = document.createElement('code');
    code.textContent = args.value;

    const copyButton = document.createElement('gnome-copy-button') as GnomeCopyButtonElement;
    copyButton.value = args.value;
    copyButton.label = args.label;
    copyButton.copiedLabel = args.copiedLabel;
    copyButton.resetDelay = args.resetDelay;
    copyButton.size = 'sm';

    demo.append(code, copyButton);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Flat: Story = {
  args: {
    variant: 'flat',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Osd: Story = {
  args: {
    osd: true,
  },
};

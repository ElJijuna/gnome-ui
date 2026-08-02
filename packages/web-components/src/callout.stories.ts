import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './callout';

interface CalloutArgs {
  dismissible: boolean;
  message: string;
  variant: 'info' | 'tip' | 'warning';
}

const ICON_PATHS: Record<CalloutArgs['variant'], string> = {
  info: '<circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 7.2v4.3M8 4.5v.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  tip: '<circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 7.2v4.3M8 4.5v.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  warning:
    '<path d="M8 1.5l7 12.5H1z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6.5v3.5M8 12v.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
};

// document.createElement('svg') creates a plain HTML-namespace element, not
// an SVGSVGElement — its innerHTML then parses in HTML mode, which doesn't
// honor XML self-closing tags (nests siblings inside one another instead).
// DOMParser with the SVG MIME type parses XML properly and produces a real,
// correctly namespaced <svg> tree.
function createIcon(variant: CalloutArgs['variant']) {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" data-slot="callout-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">${ICON_PATHS[variant]}</svg>`;
  const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');

  return document.importNode(parsed.documentElement, true);
}

function renderCallout(args: CalloutArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '100%';
  demo.style.maxWidth = '28rem';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = 'Not dismissed.';

  const callout = document.createElement('gnome-callout');
  callout.variant = args.variant;

  const icon = createIcon(args.variant);

  const message = document.createElement('span');
  message.textContent = args.message;

  callout.append(icon, message);

  if (args.dismissible) {
    const dismissButton = document.createElement('button');
    dismissButton.type = 'button';
    dismissButton.dataset.dismiss = '';
    dismissButton.setAttribute('aria-label', 'Dismiss');
    dismissButton.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M3.293 3.293a1 1 0 011.414 0L8 6.586l3.293-3.293a1 1 0 111.414 1.414L9.414 8l3.293 3.293a1 1 0 01-1.414 1.414L8 9.414l-3.293 3.293a1 1 0 01-1.414-1.414L6.586 8 3.293 4.707a1 1 0 010-1.414z"/></svg>';
    callout.append(dismissButton);
  }

  callout.addEventListener('gnome-dismiss', () => {
    eventOutput.textContent = 'Dismissed (consumer decides what happens next).';
  });

  demo.append(callout, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Callout',
  component: 'gnome-callout',
  tags: ['autodocs'],
  render: renderCallout,
  args: {
    dismissible: true,
    message: "This setting can't be changed later.",
    variant: 'info',
  },
  argTypes: {
    dismissible: {
      control: 'boolean',
      description: 'Whether to render a data-dismiss button.',
    },
    message: { control: 'text' },
    variant: {
      control: 'select',
      options: ['info', 'warning', 'tip'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Inline, dismissible admonition box for contextual help text — distinct from `gnome-banner` (persistent, edge-to-edge) and `gnome-toast` (temporary). The host never hides itself on dismiss; the consumer owns visibility.',
      },
    },
  },
} satisfies Meta<CalloutArgs>;

export default meta;
type Story = StoryObj<CalloutArgs>;

export const Interactive: Story = {};

export const Warning: Story = {
  args: {
    message: 'Double-check this value before continuing.',
    variant: 'warning',
  },
};

export const Tip: Story = {
  args: {
    message: 'Press Ctrl+K to open the command palette.',
    variant: 'tip',
  },
};

export const NotDismissible: Story = {
  args: {
    dismissible: false,
  },
};

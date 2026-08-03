import type { Meta, StoryObj } from '@storybook/web-components-vite';

import type { GnomeOtpInputChangeDetail } from './otp-input';
import './otp-input';

interface OtpInputArgs {
  disabled: boolean;
  error: string;
  helperText: string;
  label: string;
  length: number;
  masked: boolean;
  value: string;
}

function renderOtpInput(args: OtpInputArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Value: "${args.value}".`;

  const otp = document.createElement('gnome-otp-input');
  otp.setAttribute('label', args.label);
  otp.setAttribute('length', String(args.length));
  otp.toggleAttribute('masked', args.masked);
  otp.toggleAttribute('disabled', args.disabled);
  otp.value = args.value;

  if (args.error) {
    otp.setAttribute('error', args.error);
  } else if (args.helperText) {
    otp.setAttribute('helper-text', args.helperText);
  }

  otp.addEventListener('gnome-change', (event) => {
    eventOutput.textContent = `Value: "${(event as CustomEvent<GnomeOtpInputChangeDetail>).detail.value}".`;
  });

  demo.append(otp, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Otp Input',
  component: 'gnome-otp-input',
  tags: ['autodocs'],
  render: renderOtpInput,
  args: {
    disabled: false,
    error: '',
    helperText: '',
    label: 'Verification code',
    length: 6,
    masked: false,
    value: '',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables every cell.',
    },
    error: {
      control: 'text',
      description: 'Error message shown in place of helperText, announced via role="alert".',
    },
    helperText: {
      control: 'text',
      description: 'Helper text shown below the label. Hidden when error is set.',
    },
    label: {
      control: 'text',
      description: "Visible label, rendered as the group's <legend>.",
    },
    length: {
      control: { type: 'number' },
      description: 'Number of digit cells.',
    },
    masked: {
      control: 'boolean',
      description: 'Obscure entered digits like a password field.',
    },
    value: {
      control: 'text',
      description: 'Initial value — a string of up to length digits.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Segmented PIN/verification-code input — one cell per digit, with auto-advance on typing, backspace-to-previous-cell, and paste support (pasting a full code distributes it across the remaining cells).',
      },
    },
  },
} satisfies Meta<OtpInputArgs>;

export default meta;
type Story = StoryObj<OtpInputArgs>;

export const Default: Story = {};

export const WithCompletion: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const status = document.createElement('p');
    status.className = 'wc-story__event';
    status.setAttribute('aria-live', 'polite');
    status.textContent = '';

    const otp = document.createElement('gnome-otp-input');
    otp.setAttribute('label', 'Verification code');
    otp.setAttribute('helper-text', 'We sent a 6-digit code to your email.');

    otp.addEventListener('gnome-change', () => {
      status.textContent = '';
    });

    otp.addEventListener('gnome-complete', () => {
      status.textContent = 'Code complete — verifying…';
    });

    demo.append(otp, status);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Masked: Story = {
  args: {
    label: 'PIN',
    length: 4,
    masked: true,
  },
};

export const ErrorState: Story = {
  args: {
    value: '123456',
    error: 'That code is incorrect. Try again.',
  },
};

export const Disabled: Story = {
  args: {
    value: '123',
    disabled: true,
  },
};

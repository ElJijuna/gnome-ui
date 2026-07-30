import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './switch';

interface SwitchArgs {
  checked: boolean;
  disabled: boolean;
  label: string;
}

function renderSwitch(args: SwitchArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = 'The light-DOM input remains a native form control.';

  const label = document.createElement('label');
  label.style.display = 'flex';
  label.style.alignItems = 'center';
  label.style.gap = 'var(--gnome-space-2, 12px)';
  label.style.width = 'auto';

  const gnomeSwitch = document.createElement('gnome-switch');
  gnomeSwitch.disabled = args.disabled;

  const control = document.createElement('input');
  control.type = 'checkbox';
  control.setAttribute('role', 'switch');
  control.dataset.slot = 'switch-control';
  control.checked = args.checked;

  gnomeSwitch.append(control);
  label.append(gnomeSwitch, document.createTextNode(args.label));
  demo.append(label, eventOutput);
  story.append(demo);

  control.addEventListener('change', () => {
    eventOutput.textContent = `${args.label}: ${control.checked ? 'on' : 'off'}.`;
  });

  return story;
}

const meta = {
  title: 'Web Components/Switch',
  component: 'gnome-switch',
  tags: ['autodocs'],
  render: renderSwitch,
  args: {
    checked: false,
    disabled: false,
    label: 'Wi-Fi',
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Initial checked state of the native light-DOM input.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the native light-DOM input.',
    },
    label: {
      control: 'text',
      description: 'Visible label associated with the switch.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Styled light-DOM wrapper that preserves native checkbox semantics, form participation, keyboard behavior, focus, and htmx compatibility.',
      },
    },
  },
} satisfies Meta<SwitchArgs>;

export default meta;
type Story = StoryObj<SwitchArgs>;

export const Interactive: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Airplane Mode',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Bluetooth',
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Automatic Updates',
  },
};

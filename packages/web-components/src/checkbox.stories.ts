import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './checkbox';

interface CheckboxArgs {
  checked: boolean;
  disabled: boolean;
  indeterminate: boolean;
  label: string;
}

function renderCheckbox(args: CheckboxArgs) {
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

  const gnomeCheckbox = document.createElement('gnome-checkbox');
  gnomeCheckbox.disabled = args.disabled;
  gnomeCheckbox.indeterminate = args.indeterminate;

  const control = document.createElement('input');
  control.type = 'checkbox';
  control.dataset.slot = 'checkbox-control';
  control.checked = args.checked;

  gnomeCheckbox.append(control);
  label.append(gnomeCheckbox, document.createTextNode(args.label));
  demo.append(label, eventOutput);
  story.append(demo);

  control.addEventListener('change', () => {
    gnomeCheckbox.indeterminate = false;
    eventOutput.textContent = `${args.label}: ${control.checked ? 'checked' : 'unchecked'}.`;
  });

  return story;
}

const meta = {
  title: 'Web Components/Checkbox',
  component: 'gnome-checkbox',
  tags: ['autodocs'],
  render: renderCheckbox,
  args: {
    checked: false,
    disabled: false,
    indeterminate: false,
    label: 'Select item',
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
    indeterminate: {
      control: 'boolean',
      description: 'JS-only mixed state, applied imperatively to the native input.',
    },
    label: {
      control: 'text',
      description: 'Visible label associated with the checkbox.',
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
} satisfies Meta<CheckboxArgs>;

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Interactive: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Subscribe to newsletter',
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    label: 'Select all',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Read-only option',
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Locked in',
  },
};

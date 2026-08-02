import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './field-group';
import './radio-group';
import './checkbox';

interface FieldGroupArgs {
  disabled: boolean;
  error: string;
  helperText: string;
  label: string;
}

function radioLabel(text: string, name: string, value: string, checked: boolean) {
  const label = document.createElement('label');
  label.style.display = 'flex';
  label.style.alignItems = 'center';
  label.style.gap = 'var(--gnome-space-2, 12px)';
  label.style.width = 'auto';

  const control = document.createElement('input');
  control.type = 'radio';
  control.dataset.slot = 'radio-control';
  control.name = name;
  control.value = value;
  control.checked = checked;

  label.append(control, document.createTextNode(text));

  return label;
}

function renderFieldGroup(args: FieldGroupArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '100%';
  demo.style.maxWidth = '24rem';

  const group = document.createElement('gnome-field-group');
  group.setAttribute('label', args.label);
  group.toggleAttribute('disabled', args.disabled);

  if (args.error) {
    group.setAttribute('error', args.error);
  } else if (args.helperText) {
    group.setAttribute('helper-text', args.helperText);
  }

  const radioGroup = document.createElement('gnome-radio-group');
  radioGroup.setAttribute('name', 'notification-method');
  radioGroup.append(
    radioLabel('Email', 'notification-method', 'email', true),
    radioLabel('SMS', 'notification-method', 'sms', false),
    radioLabel('Push', 'notification-method', 'push', false),
  );

  group.append(radioGroup);
  demo.append(group);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Field Group',
  component: 'gnome-field-group',
  tags: ['autodocs'],
  render: renderFieldGroup,
  args: {
    disabled: false,
    error: '',
    helperText: 'Choose how you want to be notified.',
    label: 'Notification method',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the fieldset — cascades to every descendant form control for free.',
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
      description: "Group heading, rendered as the fieldset's <legend>.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Generic form-field grouping with a shared label, help text, and error message, for arbitrary fields outside a `gnome-boxed-list`. Wraps a real `<fieldset>`/`<legend>`, so `disabled` disables every descendant form control for free.',
      },
    },
  },
} satisfies Meta<FieldGroupArgs>;

export default meta;
type Story = StoryObj<FieldGroupArgs>;

export const Default: Story = {};

export const CheckboxGroup: Story = {
  render: (args) => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.width = '100%';
    demo.style.maxWidth = '24rem';

    const group = document.createElement('gnome-field-group');
    group.setAttribute('label', 'App permissions');
    group.toggleAttribute('disabled', args.disabled);

    for (const [name, checked] of [
      ['Camera', true],
      ['Microphone', false],
      ['Location', false],
    ] as const) {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = 'var(--gnome-space-2, 12px)';
      label.style.width = 'auto';

      const gnomeCheckbox = document.createElement('gnome-checkbox');
      const control = document.createElement('input');
      control.type = 'checkbox';
      control.dataset.slot = 'checkbox-control';
      control.checked = checked;
      gnomeCheckbox.append(control);

      label.append(gnomeCheckbox, document.createTextNode(name));
      group.append(label);
    }

    demo.append(group);
    story.append(demo);

    return story;
  },
  args: {
    disabled: false,
  },
  parameters: {
    controls: { disable: true },
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Select at least one notification method.',
    helperText: '',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: '`disabled` disables every descendant form control automatically.',
      },
    },
  },
};

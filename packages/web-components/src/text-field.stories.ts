import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './text-field';

interface TextFieldArgs {
  disabled: boolean;
  hint: string;
  invalid: boolean;
  label: string;
  placeholder: string;
}

function renderTextField(args: TextFieldArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const field = document.createElement('gnome-text-field');
  field.disabled = args.disabled;
  field.invalid = args.invalid;

  const label = document.createElement('label');
  label.dataset.slot = 'text-field-label';
  label.textContent = args.label;

  const control = document.createElement('input');
  control.type = 'text';
  control.dataset.slot = 'text-field-control';
  control.placeholder = args.placeholder;

  field.append(label, control);

  if (args.hint) {
    const hint = document.createElement('span');
    hint.dataset.slot = 'text-field-hint';
    hint.textContent = args.hint;
    field.append(hint);
  }

  demo.append(field);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Text Field',
  component: 'gnome-text-field',
  tags: ['autodocs'],
  render: renderTextField,
  args: {
    disabled: false,
    hint: 'Choose a unique handle.',
    invalid: false,
    label: 'Username',
    placeholder: 'octocat',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the native light-DOM control and dims the whole field.',
    },
    hint: {
      control: 'text',
      description: 'Helper or error text, linked to the control via aria-describedby.',
    },
    invalid: {
      control: 'boolean',
      description: 'Applies the error visual state and sets aria-invalid on the control.',
    },
    label: {
      control: 'text',
      description: 'Visible label, linked to the control via for/id.',
    },
    placeholder: {
      control: 'text',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Styled light-DOM wrapper around a native text input or textarea, with label and helper/error text slots wired via for/id and aria-describedby.',
      },
    },
  },
} satisfies Meta<TextFieldArgs>;

export default meta;
type Story = StoryObj<TextFieldArgs>;

export const Interactive: Story = {};

export const Invalid: Story = {
  args: {
    hint: 'This handle is already taken.',
    invalid: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './dropdown';

interface DropdownArgs {
  disabled: boolean;
  placeholder: string;
  value: string;
}

const THEMES: Array<{ value: string; label: string; description?: string; disabled?: boolean }> = [
  { value: 'light', label: 'Light', description: 'Bright and airy' },
  { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
  { value: 'hc', label: 'High contrast', disabled: true },
  { value: 'auto', label: 'Automatic', description: 'Follows system setting' },
];

function renderDropdown(args: DropdownArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.minHeight = '260px';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Value: ${args.value || '(none)'}`;

  const dropdown = document.createElement('gnome-dropdown');
  dropdown.placeholder = args.placeholder;
  dropdown.disabled = args.disabled;
  dropdown.value = args.value;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.dataset.slot = 'dropdown-trigger';

  const content = document.createElement('ul');
  content.dataset.slot = 'dropdown-content';

  for (const theme of THEMES) {
    const option = document.createElement('li');
    option.dataset.option = '';
    option.dataset.value = theme.value;

    if (theme.disabled) {
      option.setAttribute('aria-disabled', 'true');
    }

    const label = document.createElement('span');
    label.dataset.slot = 'option-label';
    label.textContent = theme.label;
    option.append(label);

    if (theme.description) {
      const description = document.createElement('span');
      description.dataset.slot = 'option-description';
      description.textContent = theme.description;
      option.append(description);
    }

    content.append(option);
  }

  dropdown.append(trigger, content);
  dropdown.addEventListener('gnome-change', (event) => {
    eventOutput.textContent = `Value: ${(event as CustomEvent<{ value: string }>).detail.value}`;
  });

  demo.append(dropdown, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Dropdown',
  component: 'gnome-dropdown',
  tags: ['autodocs'],
  render: renderDropdown,
  args: {
    disabled: false,
    placeholder: 'Select a theme',
    value: '',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the native trigger button.',
    },
    placeholder: {
      control: 'text',
      description: 'Shown in the trigger when no value is selected.',
    },
    value: {
      control: 'select',
      options: ['', 'light', 'dark', 'auto'],
      description: 'The selected option value.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Combo-box-style option list (`role="combobox"` + `role="listbox"`). Focus stays on the trigger — the active option is tracked via `aria-activedescendant`, not DOM focus, following the standard ARIA combobox pattern.',
      },
    },
  },
} satisfies Meta<DropdownArgs>;

export default meta;
type Story = StoryObj<DropdownArgs>;

export const Interactive: Story = {};

export const Preselected: Story = {
  args: {
    value: 'dark',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'light',
  },
};

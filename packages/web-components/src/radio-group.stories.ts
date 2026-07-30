import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './radio-group';

interface RadioGroupArgs {
  disabled: boolean;
  value: string;
}

const OPTIONS = [
  { label: 'List', value: 'list' },
  { label: 'Grid', value: 'grid' },
  { label: 'Compact', value: 'compact' },
];

function renderRadioGroup(args: RadioGroupArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `View: ${args.value}.`;

  const group = document.createElement('gnome-radio-group');
  group.setAttribute('name', 'view-mode');
  group.disabled = args.disabled;

  for (const option of OPTIONS) {
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = 'var(--gnome-space-2, 12px)';
    label.style.width = 'auto';

    const control = document.createElement('input');
    control.type = 'radio';
    control.dataset.slot = 'radio-control';
    control.value = option.value;
    control.checked = option.value === args.value;

    label.append(control, document.createTextNode(option.label));
    group.append(label);
  }

  demo.append(group, eventOutput);
  story.append(demo);

  group.addEventListener('gnome-change', (event) => {
    eventOutput.textContent = `View: ${event.detail.value}.`;
  });

  return story;
}

const meta = {
  title: 'Web Components/Radio Group',
  component: 'gnome-radio-group',
  tags: ['autodocs'],
  render: renderRadioGroup,
  args: {
    disabled: false,
    value: 'list',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables every native light-DOM radio in the group.',
    },
    value: {
      control: 'select',
      options: OPTIONS.map((option) => option.value),
      description: 'Initially selected value.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Styled light-DOM wrapper around native radio inputs sharing one name. Native browsers already provide mutual exclusivity and arrow-key cycling; the host adds shared naming, group-level disabling, and a normalized value/gnome-change API.',
      },
    },
  },
} satisfies Meta<RadioGroupArgs>;

export default meta;
type Story = StoryObj<RadioGroupArgs>;

export const Interactive: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'grid',
  },
};

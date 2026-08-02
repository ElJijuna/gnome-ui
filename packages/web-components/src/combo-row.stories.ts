import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './combo-row';
import './dropdown';

interface ComboRowArgs {
  disabled: boolean;
  subtitle: string;
  title: string;
  value: string;
}

function renderComboRow(args: ComboRowArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '100%';
  demo.style.maxWidth = '32rem';
  demo.style.border = '1px solid var(--gnome-card-shade-color, rgb(0 0 0 / 0.12))';
  demo.style.borderRadius = 'var(--gnome-radius-md, 8px)';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Value: ${args.value}`;

  const comboRow = document.createElement('gnome-combo-row');
  comboRow.disabled = args.disabled;

  const title = document.createElement('span');
  title.dataset.slot = 'row-title';
  title.textContent = args.title;

  const subtitle = document.createElement('span');
  subtitle.dataset.slot = 'row-subtitle';
  subtitle.textContent = args.subtitle;

  const dropdown = document.createElement('gnome-dropdown');
  dropdown.dataset.slot = 'row-suffix';
  dropdown.value = args.value;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.dataset.slot = 'dropdown-trigger';

  const content = document.createElement('ul');
  content.dataset.slot = 'dropdown-content';

  for (const [value, label] of [
    ['light', 'Light'],
    ['dark', 'Dark'],
    ['auto', 'Automatic'],
  ]) {
    const option = document.createElement('li');
    option.dataset.option = '';
    option.dataset.value = value;
    option.textContent = label;
    content.append(option);
  }

  dropdown.append(trigger, content);
  dropdown.addEventListener('gnome-change', (event) => {
    eventOutput.textContent = `Value: ${(event as CustomEvent<{ value: string }>).detail.value}`;
  });

  comboRow.append(title, subtitle, dropdown);
  demo.append(comboRow, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Combo Row',
  component: 'gnome-combo-row',
  tags: ['autodocs'],
  render: renderComboRow,
  args: {
    disabled: false,
    subtitle: 'Choose your preferred color scheme',
    title: 'Theme',
    value: 'dark',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Dims the row and disables the nested dropdown.',
    },
    subtitle: { control: 'text' },
    title: { control: 'text' },
    value: {
      control: 'select',
      options: ['light', 'dark', 'auto'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Settings row with an inline combo selector — mirrors `AdwComboRow`. Genuinely composes `gnome-action-row`\'s layout conventions with a real, consumer-authored `<gnome-dropdown>` in `data-slot="row-suffix"`; no combobox logic is duplicated.',
      },
    },
  },
} satisfies Meta<ComboRowArgs>;

export default meta;
type Story = StoryObj<ComboRowArgs>;

export const Interactive: Story = {};

export const NoSubtitle: Story = {
  args: {
    subtitle: '',
    title: 'Language',
    value: 'auto',
  },
  render: (args) => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.width = '100%';
    demo.style.maxWidth = '32rem';
    demo.style.border = '1px solid var(--gnome-card-shade-color, rgb(0 0 0 / 0.12))';
    demo.style.borderRadius = 'var(--gnome-radius-md, 8px)';

    const comboRow = document.createElement('gnome-combo-row');

    const title = document.createElement('span');
    title.dataset.slot = 'row-title';
    title.textContent = args.title;

    const dropdown = document.createElement('gnome-dropdown');
    dropdown.dataset.slot = 'row-suffix';
    dropdown.value = args.value;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.dataset.slot = 'dropdown-trigger';

    const content = document.createElement('ul');
    content.dataset.slot = 'dropdown-content';

    for (const [value, label] of [
      ['auto', 'Automatic'],
      ['en', 'English'],
      ['es', 'Español'],
    ]) {
      const option = document.createElement('li');
      option.dataset.option = '';
      option.dataset.value = value;
      option.textContent = label;
      content.append(option);
    }

    dropdown.append(trigger, content);
    comboRow.append(title, dropdown);
    demo.append(comboRow);
    story.append(demo);

    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Omitting `row-subtitle` still lays out correctly — CSS grid areas collapse the empty row.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './switch-row';

interface SwitchRowArgs {
  checked: boolean;
  disabled: boolean;
  subtitle: string;
  title: string;
}

function renderSwitchRow(args: SwitchRowArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '100%';
  demo.style.maxWidth = '32rem';

  const card = document.createElement('div');
  card.style.border = '1px solid var(--gnome-card-shade-color, rgb(0 0 0 / 0.12))';
  card.style.borderRadius = 'var(--gnome-radius-md, 8px)';
  card.style.overflow = 'hidden';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Checked: ${args.checked}`;

  const switchRow = document.createElement('gnome-switch-row');
  switchRow.checked = args.checked;
  switchRow.disabled = args.disabled;

  const title = document.createElement('span');
  title.dataset.slot = 'row-title';
  title.textContent = args.title;

  const subtitle = document.createElement('span');
  subtitle.dataset.slot = 'row-subtitle';
  subtitle.textContent = args.subtitle;

  switchRow.append(title, subtitle);
  switchRow.addEventListener('gnome-change', (event) => {
    eventOutput.textContent = `Checked: ${(event as CustomEvent<{ checked: boolean }>).detail.checked}`;
  });

  card.append(switchRow);
  demo.append(card, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Switch Row',
  component: 'gnome-switch-row',
  tags: ['autodocs'],
  render: renderSwitchRow,
  args: {
    checked: false,
    disabled: false,
    subtitle: 'Get notified about updates',
    title: 'Notifications',
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: {
      control: 'boolean',
      description: 'Dims the row and disables the generated button surface.',
    },
    subtitle: { control: 'text' },
    title: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Activatable settings row with an integrated switch — mirrors `AdwSwitchRow`. The entire row is the switch (clicking anywhere toggles it), genuinely different from `gnome-action-row` with a nested `gnome-switch`.',
      },
    },
  },
} satisfies Meta<SwitchRowArgs>;

export default meta;
type Story = StoryObj<SwitchRowArgs>;

export const Interactive: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

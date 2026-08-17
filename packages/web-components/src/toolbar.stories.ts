import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './toolbar';
import './button';
import './linked-group';
import './divider';
import './separator';
import './dropdown';

function gnomeButton(label: string, variant: 'default' | 'flat' | 'suggested' = 'flat') {
  const button = document.createElement('gnome-button');
  button.variant = variant;

  const control = document.createElement('button');
  control.type = 'button';
  control.dataset.slot = 'button-control';
  control.textContent = label;

  button.append(control);

  return button;
}

function gnomeDropdown() {
  const dropdown = document.createElement('gnome-dropdown');
  dropdown.placeholder = 'View';
  dropdown.value = 'grid';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.dataset.slot = 'dropdown-trigger';

  const content = document.createElement('ul');
  content.dataset.slot = 'dropdown-content';

  for (const [value, label] of [
    ['grid', 'Grid'],
    ['list', 'List'],
  ]) {
    const option = document.createElement('li');
    option.dataset.option = '';
    option.dataset.value = value;

    const optionLabel = document.createElement('span');
    optionLabel.dataset.slot = 'option-label';
    optionLabel.textContent = label;
    option.append(optionLabel);

    content.append(option);
  }

  dropdown.append(trigger, content);

  return dropdown;
}

function renderToolbar() {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.padding = '0';

  const toolbar = document.createElement('gnome-toolbar');
  toolbar.style.background = 'var(--gnome-headerbar-bg-color, #ebebeb)';
  toolbar.style.borderRadius = '8px';
  toolbar.style.width = '100%';

  const formatGroup = document.createElement('gnome-linked-group');
  formatGroup.append(gnomeButton('Bold'), gnomeButton('Italic'), gnomeButton('Underline'));

  const separator = document.createElement('gnome-separator');
  separator.orientation = 'vertical';
  separator.style.height = '24px';

  const spacer = document.createElement('div');
  spacer.style.flex = '1';

  toolbar.append(
    gnomeButton('←'),
    gnomeButton('→'),
    formatGroup,
    separator,
    gnomeDropdown(),
    spacer,
    gnomeButton('Save', 'suggested'),
  );

  demo.append(toolbar);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Toolbar',
  component: 'gnome-toolbar',
  tags: ['autodocs'],
  render: renderToolbar,
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal action bar following the libadwaita `.toolbar` style class — 6px padding and gap for rows of flat/raised buttons, dropdowns, dividers, and gnome-linked-group clusters. Pure CSS host; consumer-authored children render directly in DOM order.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Interactive: Story = {};

export const WithDivider: Story = {
  name: 'With divider',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.padding = '0';

    const toolbar = document.createElement('gnome-toolbar');
    toolbar.style.flexDirection = 'column';
    toolbar.style.background = 'var(--gnome-headerbar-bg-color, #ebebeb)';
    toolbar.style.borderRadius = '8px';
    toolbar.style.width = '100%';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '6px';
    row.append(gnomeButton('New'), gnomeButton('Open'), gnomeButton('Save', 'suggested'));

    const divider = document.createElement('gnome-divider');
    divider.style.width = '100%';

    const row2 = document.createElement('div');
    row2.style.display = 'flex';
    row2.style.gap = '6px';
    row2.append(gnomeButton('Undo'), gnomeButton('Redo'));

    toolbar.append(row, divider, row2);
    demo.append(toolbar);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'gnome-divider splits a stacked toolbar into labeled or unlabeled sections.',
      },
    },
  },
};

export const Empty: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.padding = '0';

    const toolbar = document.createElement('gnome-toolbar');
    toolbar.style.background = 'var(--gnome-headerbar-bg-color, #ebebeb)';
    toolbar.style.borderRadius = '8px';
    toolbar.style.width = '100%';

    demo.append(toolbar);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The bare 46px-min-height bar with no children — establishes the baseline height.',
      },
    },
  },
};

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './menu';

interface MenuArgs {
  label: string;
  open: boolean;
  placement: 'bottom' | 'left' | 'right' | 'top';
}

function renderMenu(args: MenuArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = 'Use Arrow keys, Home, End, or type an item name.';

  const menu = document.createElement('gnome-menu');
  menu.placement = args.placement;
  menu.open = args.open;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.dataset.slot = 'menu-trigger';
  trigger.textContent = args.label;

  const content = document.createElement('section');
  content.dataset.slot = 'menu-content';

  const heading = document.createElement('span');
  heading.dataset.slot = 'menu-label';
  heading.textContent = 'Project';

  const rename = document.createElement('button');
  rename.type = 'button';
  rename.dataset.menuItem = '';
  rename.dataset.value = 'rename';
  rename.textContent = 'Rename';

  const duplicate = document.createElement('button');
  duplicate.type = 'button';
  duplicate.dataset.menuItem = '';
  duplicate.dataset.value = 'duplicate';
  duplicate.disabled = true;
  duplicate.textContent = 'Duplicate (unavailable)';

  const archive = document.createElement('button');
  archive.type = 'button';
  archive.dataset.menuItem = '';
  archive.dataset.value = 'archive';
  archive.textContent = 'Archive';

  const shortcut = document.createElement('span');
  shortcut.dataset.slot = 'menu-shortcut';
  shortcut.setAttribute('aria-hidden', 'true');
  shortcut.textContent = '⇧⌘A';
  archive.append(shortcut);

  const separator = document.createElement('hr');
  separator.dataset.slot = 'menu-separator';

  const settings = document.createElement('a');
  settings.href = '#settings';
  settings.dataset.menuItem = '';
  settings.dataset.value = 'settings';
  settings.textContent = 'Project settings';

  content.append(heading, rename, duplicate, archive, separator, settings);
  menu.append(trigger, content);
  demo.append(menu, eventOutput);
  story.append(demo);

  menu.addEventListener('gnome-select', (event) => {
    eventOutput.textContent = `Selected ${event.detail.value}.`;
  });

  menu.addEventListener('gnome-open-change', (event) => {
    if (!event.detail.open && eventOutput.textContent?.startsWith('Use')) {
      eventOutput.textContent = 'Menu closed.';
    }
  });

  return story;
}

const meta = {
  title: 'Web Components/Menu',
  component: 'gnome-menu',
  tags: ['autodocs'],
  render: renderMenu,
  args: {
    label: 'Project options',
    open: false,
    placement: 'bottom',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible trigger label.',
    },
    open: {
      control: 'boolean',
      description: 'Reflects the open attribute.',
    },
    placement: {
      control: 'select',
      options: ['bottom', 'top', 'right', 'left'],
      description: 'Preferred placement before viewport collision handling.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Light-DOM action menu with managed keyboard focus, typeahead, disabled-item handling, viewport-aware placement, and cancelable selection events.',
      },
    },
  },
} satisfies Meta<MenuArgs>;

export default meta;
type Story = StoryObj<MenuArgs>;

export const Interactive: Story = {};

export const InitiallyOpen: Story = {
  args: {
    open: true,
  },
};

export const TopPlacement: Story = {
  args: {
    placement: 'top',
  },
};

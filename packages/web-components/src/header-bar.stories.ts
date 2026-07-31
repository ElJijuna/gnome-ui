import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './header-bar';

interface HeaderBarArgs {
  flat: boolean;
  title: string;
}

function renderButton(label: string, ariaLabel?: string) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;

  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }

  return button;
}

function renderStory(args: HeaderBarArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.padding = '0';

  const bar = document.createElement('gnome-header-bar');
  bar.style.width = '100%';
  bar.flat = args.flat;

  const title = document.createElement('span');
  title.dataset.slot = 'header-title';
  title.textContent = args.title;
  bar.append(title);

  demo.append(bar);
  story.append(demo);
  return story;
}

const meta = {
  title: 'Web Components/Header Bar',
  component: 'gnome-header-bar',
  tags: ['autodocs'],
  render: renderStory,
  args: {
    flat: false,
    title: 'Inbox',
  },
  argTypes: {
    title: { control: 'text' },
    flat: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Title bar with data-slot="header-start"/"header-title"/"header-end" regions, placed in explicit CSS grid columns so the title stays centered even without a start or end slot.',
      },
    },
  },
} satisfies Meta<HeaderBarArgs>;

export default meta;
type Story = StoryObj<HeaderBarArgs>;

export const Default: Story = {};

export const WithActions: Story = {
  name: 'With actions',
  args: { title: 'Contacts' },
  render: (args) => {
    const story = renderStory(args);
    const bar = story.querySelector('gnome-header-bar');

    const startSlot = document.createElement('span');
    startSlot.dataset.slot = 'header-start';
    startSlot.append(renderButton('← Back', 'Back'));
    bar?.prepend(startSlot);

    const endSlot = document.createElement('span');
    endSlot.dataset.slot = 'header-end';
    endSlot.append(renderButton('+ Add', 'Add contact'));
    bar?.append(endSlot);

    return story;
  },
};

export const MultipleActions: Story = {
  name: 'Multiple trailing actions',
  args: { title: 'Files' },
  render: (args) => {
    const story = renderStory(args);
    const bar = story.querySelector('gnome-header-bar');

    const startSlot = document.createElement('span');
    startSlot.dataset.slot = 'header-start';
    startSlot.append(renderButton('☰', 'Toggle sidebar'));
    bar?.prepend(startSlot);

    const endSlot = document.createElement('span');
    endSlot.dataset.slot = 'header-end';
    endSlot.append(
      renderButton('+ Folder', 'New folder'),
      renderButton('⌕', 'Search'),
      renderButton('⋮', 'View options'),
    );
    bar?.append(endSlot);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Flat: Story = {
  args: { flat: true, title: 'Settings' },
  render: (args) => {
    const story = renderStory(args);
    const bar = story.querySelector('gnome-header-bar');

    const endSlot = document.createElement('span');
    endSlot.dataset.slot = 'header-end';
    endSlot.append(renderButton('Done'));
    bar?.append(endSlot);

    return story;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use flat for the topmost bar — removes the bottom border so it merges with the window chrome.',
      },
    },
  },
};

export const CustomTitle: Story = {
  name: 'Custom title',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.padding = '0';

    const bar = document.createElement('gnome-header-bar');
    bar.style.width = '100%';

    const startSlot = document.createElement('span');
    startSlot.dataset.slot = 'header-start';
    startSlot.append(renderButton('← Back'));

    const title = document.createElement('span');
    title.dataset.slot = 'header-title';
    // Override the default single-line ellipsis styling for this two-line title.
    title.style.display = 'flex';
    title.style.flexDirection = 'column';
    title.style.alignItems = 'center';
    title.style.gap = '1px';
    title.style.whiteSpace = 'normal';
    title.style.fontWeight = 'normal';

    const heading = document.createElement('strong');
    heading.textContent = 'Music';

    const caption = document.createElement('span');
    caption.textContent = '42 songs';
    caption.style.fontSize = '0.75rem';
    caption.style.opacity = '0.6';

    title.append(heading, caption);

    const endSlot = document.createElement('span');
    endSlot.dataset.slot = 'header-end';
    endSlot.append(renderButton('⋮'));

    bar.append(startSlot, title, endSlot);
    demo.append(bar);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'header-title carries default single-line typography (font-weight, ellipsis); override those inline for a custom two-line title.',
      },
    },
  },
};

export const InLayout: Story = {
  name: 'In a full layout',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.maxWidth = '480px';
    demo.style.padding = '0';

    const frame = document.createElement('div');
    frame.style.border = '1px solid rgb(0 0 0 / 0.1)';
    frame.style.borderRadius = '12px';
    frame.style.overflow = 'hidden';

    const bar = document.createElement('gnome-header-bar');

    const startSlot = document.createElement('span');
    startSlot.dataset.slot = 'header-start';
    startSlot.append(renderButton('← Back'));

    const title = document.createElement('span');
    title.dataset.slot = 'header-title';
    title.textContent = 'Preferences';

    const endSlot = document.createElement('span');
    endSlot.dataset.slot = 'header-end';
    endSlot.append(renderButton('Save'));

    bar.append(startSlot, title, endSlot);

    const content = document.createElement('div');
    content.style.padding = '24px';
    content.style.opacity = '0.4';
    content.textContent = 'View content area';

    frame.append(bar, content);
    demo.append(frame);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The header bar sits at the top of a view, spanning its full width.',
      },
    },
  },
};

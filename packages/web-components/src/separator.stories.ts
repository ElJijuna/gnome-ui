import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './separator';

interface SeparatorArgs {
  orientation: 'horizontal' | 'vertical';
}

function renderText(text: string) {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

function renderSeparator(args: SeparatorArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.flexDirection = 'column';
  demo.style.gap = '12px';
  demo.style.maxWidth = '320px';

  const separator = document.createElement('gnome-separator');
  separator.orientation = args.orientation;

  demo.append(renderText('First section'), separator, renderText('Second section'));
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Separator',
  component: 'gnome-separator',
  tags: ['autodocs'],
  render: renderSeparator,
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Thin dividing line that separates groups of content. The host manages role="separator" and aria-orientation itself since a custom element is always a single fixed tag.',
      },
    },
  },
} satisfies Meta<SeparatorArgs>;

export default meta;
type Story = StoryObj<SeparatorArgs>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.flexDirection = 'row';
    demo.style.alignItems = 'center';
    demo.style.gap = '12px';
    demo.style.height = '32px';

    const labels = ['Files', 'Music', 'Photos'];

    labels.forEach((label, index) => {
      demo.append(renderText(label));

      if (index < labels.length - 1) {
        const separator = document.createElement('gnome-separator');
        separator.orientation = args.orientation;
        demo.append(separator);
      }
    });

    story.append(demo);
    return story;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vertical separators work inside flex rows. The line stretches to match the row height via align-self: stretch.',
      },
    },
  },
};

export const InList: Story = {
  name: 'In a list',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.flexDirection = 'column';
    demo.style.maxWidth = '240px';

    const items = ['Inbox', 'Drafts', 'Sent', 'Trash'];

    items.forEach((item, index) => {
      const row = document.createElement('div');
      row.style.padding = '8px 12px';
      row.append(renderText(item));
      demo.append(row);

      if (index < items.length - 1) {
        demo.append(document.createElement('gnome-separator'));
      }
    });

    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './linked-group';
import './button';
import './text-field';
import './toolbar';

interface LinkedGroupArgs {
  vertical: boolean;
}

function gnomeButton(label: string, variant: 'default' | 'flat' | 'suggested' = 'default') {
  const button = document.createElement('gnome-button');
  button.variant = variant;

  const control = document.createElement('button');
  control.type = 'button';
  control.dataset.slot = 'button-control';
  control.textContent = label;

  button.append(control);

  return button;
}

function renderLinkedGroup(args: LinkedGroupArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const group = document.createElement('gnome-linked-group');
  group.vertical = args.vertical;
  group.append(gnomeButton('Cut'), gnomeButton('Copy'), gnomeButton('Paste'));

  demo.append(group);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Linked Group',
  component: 'gnome-linked-group',
  tags: ['autodocs'],
  render: renderLinkedGroup,
  args: {
    vertical: false,
  },
  argTypes: {
    vertical: {
      control: 'boolean',
      description: 'Stack children vertically instead of horizontally.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Renders children as a single visually-connected unit with merged borders — the canonical GNOME pattern for button groups and segmented inputs. Mirrors the libadwaita `.linked` style class.',
      },
    },
  },
} satisfies Meta<LinkedGroupArgs>;

export default meta;
type Story = StoryObj<LinkedGroupArgs>;

export const Interactive: Story = {};

export const Suggested: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const group = document.createElement('gnome-linked-group');
    group.append(
      gnomeButton('Day', 'suggested'),
      gnomeButton('Week', 'suggested'),
      gnomeButton('Month', 'suggested'),
    );

    demo.append(group);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All children share the same variant. Works with any gnome-button variant.',
      },
    },
  },
};

export const ZoomControls: Story = {
  name: 'Zoom controls',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const group = document.createElement('gnome-linked-group');
    const zoomOut = gnomeButton('−');
    zoomOut.querySelector('button')?.setAttribute('aria-label', 'Zoom out');
    const zoomReset = gnomeButton('100 %');
    zoomReset.querySelector('button')?.setAttribute('aria-label', 'Reset zoom');
    const zoomIn = gnomeButton('+');
    zoomIn.querySelector('button')?.setAttribute('aria-label', 'Zoom in');

    group.append(zoomOut, zoomReset, zoomIn);

    demo.append(group);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'A common use case: zoom controls where − and + are tightly coupled.',
      },
    },
  },
};

export const SearchWithButton: Story = {
  name: 'Search + button',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const group = document.createElement('gnome-linked-group');

    const field = document.createElement('gnome-text-field');
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Search…';
    input.setAttribute('aria-label', 'Search');
    input.dataset.slot = 'text-field-control';
    field.append(input);

    group.append(field, gnomeButton('Go', 'suggested'));

    demo.append(group);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Mix different widget types that belong together — a text field and a submit button rendered as one unit.',
      },
    },
  },
};

export const Vertical: Story = {
  args: { vertical: true },
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const group = document.createElement('gnome-linked-group');
    group.vertical = true;
    group.append(gnomeButton('Top'), gnomeButton('Middle'), gnomeButton('Bottom'));

    demo.append(group);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Use the vertical attribute to stack children in a column. Border collapse and radius restoration apply to top/bottom edges.',
      },
    },
  },
};

export const InsideToolbar: Story = {
  name: 'Inside toolbar',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const toolbar = document.createElement('gnome-toolbar');
    toolbar.style.background = 'var(--gnome-headerbar-bg-color, #ebebeb)';
    toolbar.style.borderRadius = '8px';
    toolbar.style.width = '100%';

    const group = document.createElement('gnome-linked-group');
    group.append(
      gnomeButton('Bold', 'flat'),
      gnomeButton('Italic', 'flat'),
      gnomeButton('Underline', 'flat'),
    );

    const spacer = document.createElement('div');
    spacer.style.flex = '1';

    toolbar.append(
      gnomeButton('←', 'flat'),
      gnomeButton('→', 'flat'),
      group,
      spacer,
      gnomeButton('⋮', 'flat'),
    );

    demo.append(toolbar);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'gnome-linked-group inside a gnome-toolbar — the connected group stands out from the surrounding flat buttons.',
      },
    },
  },
};

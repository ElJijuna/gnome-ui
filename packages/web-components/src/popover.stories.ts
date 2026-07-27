import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './popover';

interface PopoverArgs {
  heading: string;
  open: boolean;
  placement: 'bottom' | 'left' | 'right' | 'top';
}

function renderPopover(args: PopoverArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = 'Resize the viewport to exercise flipping and clamping.';

  const popover = document.createElement('gnome-popover');
  popover.placement = args.placement;
  popover.open = args.open;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.dataset.slot = 'popover-trigger';
  trigger.textContent = 'Project options';

  const content = document.createElement('section');
  content.dataset.slot = 'popover-content';

  const heading = document.createElement('strong');
  heading.textContent = args.heading;

  const rename = document.createElement('button');
  rename.type = 'button';
  rename.textContent = 'Rename';

  const duplicate = document.createElement('button');
  duplicate.type = 'button';
  duplicate.textContent = 'Duplicate';

  const archive = document.createElement('button');
  archive.type = 'button';
  archive.textContent = 'Archive';

  content.append(heading, rename, duplicate, archive);
  popover.append(trigger, content);
  demo.append(popover, eventOutput);
  story.append(demo);

  popover.addEventListener('gnome-open-change', (event) => {
    const { open } = (event as CustomEvent<{ open: boolean }>).detail;
    eventOutput.textContent = open ? `Popover opened at ${popover.placement}.` : 'Popover closed.';
  });

  return story;
}

const meta = {
  title: 'Web Components/Popover',
  component: 'gnome-popover',
  tags: ['autodocs'],
  render: renderPopover,
  args: {
    heading: 'Actions',
    open: false,
    placement: 'bottom',
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Example light-DOM content.',
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
          'Anchored popover with ARIA trigger relationships, viewport-aware placement, outside dismissal, and focus restoration.',
      },
    },
  },
} satisfies Meta<PopoverArgs>;

export default meta;
type Story = StoryObj<PopoverArgs>;

export const Interactive: Story = {};

export const InitiallyOpen: Story = {
  args: {
    open: true,
  },
};

export const RightPlacement: Story = {
  args: {
    placement: 'right',
  },
};

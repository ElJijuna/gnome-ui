import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './tooltip';

interface TooltipArgs {
  delay: number;
  label: string;
  placement: 'bottom' | 'left' | 'right' | 'top';
}

function renderTrigger(text: string) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.slot = 'tooltip-trigger';
  button.textContent = text;
  return button;
}

function renderTooltip(args: TooltipArgs, triggerText = 'Save') {
  const tooltip = document.createElement('gnome-tooltip');
  tooltip.placement = args.placement;
  tooltip.delay = args.delay;

  const content = document.createElement('span');
  content.dataset.slot = 'tooltip-content';
  content.textContent = args.label;

  tooltip.append(renderTrigger(triggerText), content);
  return tooltip;
}

function renderStory(args: TooltipArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.padding = '48px';
  demo.style.justifyItems = 'center';

  demo.append(renderTooltip(args));
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Tooltip',
  component: 'gnome-tooltip',
  tags: ['autodocs'],
  render: renderStory,
  args: {
    delay: 500,
    label: 'Save file (Ctrl+S)',
    placement: 'top',
  },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    delay: { control: { type: 'number', min: 0, max: 2000, step: 100 } },
    label: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Informational tooltip shown on hover or keyboard focus of [data-slot="tooltip-trigger"]. Positioned via the same computeFloatingPosition helper gnome-popover uses.',
      },
    },
  },
} satisfies Meta<TooltipArgs>;

export default meta;
type Story = StoryObj<TooltipArgs>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
};

export const Placements: Story = {
  render: (args) => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'grid';
    demo.style.gridTemplateColumns = 'repeat(3, auto)';
    demo.style.gap = '12px';
    demo.style.justifyContent = 'center';
    demo.style.alignItems = 'center';
    demo.style.padding = '48px';

    const cells = {
      bottom: renderTooltip({ ...args, delay: 0, placement: 'bottom' }, 'Bottom'),
      left: renderTooltip({ ...args, delay: 0, placement: 'left' }, 'Left'),
      right: renderTooltip({ ...args, delay: 0, placement: 'right' }, 'Right'),
      top: renderTooltip({ ...args, delay: 0, placement: 'top' }, 'Top'),
    };

    demo.append(
      document.createElement('span'),
      cells.top,
      document.createElement('span'),
      cells.left,
      document.createElement('span'),
      cells.right,
      document.createElement('span'),
      cells.bottom,
      document.createElement('span'),
    );

    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All four placements. The tooltip flips automatically if there is not enough viewport space.',
      },
    },
  },
};

export const IconToolbar: Story = {
  name: 'Icon toolbar',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.gap = '4px';
    demo.style.padding = '24px';

    const actions: Array<[string, string]> = [
      ['✎', 'Edit'],
      ['⧉', 'Copy'],
      ['🗑', 'Delete'],
      ['⚙', 'Settings'],
    ];

    for (const [glyph, label] of actions) {
      demo.append(renderTooltip({ delay: 500, label, placement: 'top' }, glyph));
    }

    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The canonical use case: icon-only toolbar buttons where the tooltip provides the missing label.',
      },
    },
  },
};

export const NoDelay: Story = {
  name: 'No delay',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.gap = '8px';
    demo.style.padding = '32px';

    demo.append(
      renderTooltip({ delay: 0, label: 'Appears instantly', placement: 'top' }, 'Hover me (delay=0)'),
      renderTooltip(
        { delay: 500, label: 'Standard 500 ms delay', placement: 'top' },
        'Hover me (default)',
      ),
    );

    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'delay="0" makes the tooltip appear immediately. The default 500ms delay avoids distracting flicker during normal mouse movement.',
      },
    },
  },
};

export const KeyboardFocus: Story = {
  name: 'With keyboard focus',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.flexDirection = 'column';
    demo.style.gap = '8px';
    demo.style.padding = '32px';

    const hint = document.createElement('p');
    hint.textContent = 'Tab into the buttons to see tooltips via keyboard';
    hint.style.opacity = '0.6';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.append(
      renderTooltip({ delay: 0, label: 'Search the library', placement: 'top' }, '🔍'),
      renderTooltip({ delay: 0, label: 'More information', placement: 'top' }, 'ℹ'),
    );

    demo.append(hint, row);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Tooltips appear on keyboard focus too, making them accessible without a mouse.',
      },
    },
  },
};

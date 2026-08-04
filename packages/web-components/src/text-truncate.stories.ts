import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './text-truncate';
import type { GnomeTextTruncateElement } from './text-truncate';

interface TextTruncateArgs {
  text: string;
  lines: number;
  tooltipPlacement: 'bottom' | 'left' | 'right' | 'top';
  width: number;
}

function renderTextTruncate(args: TextTruncateArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const box = document.createElement('div');
  box.style.width = `${args.width}px`;
  box.style.border = '1px dashed var(--gnome-borders-color, #ccc)';

  const textTruncate = document.createElement('gnome-text-truncate') as GnomeTextTruncateElement;
  textTruncate.textContent = args.text;
  textTruncate.lines = args.lines;
  textTruncate.tooltipPlacement = args.tooltipPlacement;

  box.append(textTruncate);
  demo.append(box);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Text Truncate',
  component: 'gnome-text-truncate',
  tags: ['autodocs'],
  render: renderTextTruncate,
  args: {
    text: 'A very long file name that might not fit in the available space.txt',
    lines: 1,
    tooltipPlacement: 'top',
    width: 220,
  },
  argTypes: {
    text: { control: 'text' },
    lines: {
      control: { type: 'number', min: 1, max: 6, step: 1 },
      description: '1 (default) truncates to a single line; above 1 clamps to that many lines.',
    },
    tooltipPlacement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Tooltip placement shown when the text is truncated.',
    },
    width: { control: { type: 'number', min: 80, max: 400, step: 10 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Single/multi-line text truncation with an automatic tooltip revealing the full content on overflow, measured via `ResizeObserver`. The text is authored as plain light-DOM content — same as `gnome-kbd`.',
      },
    },
  },
} satisfies Meta<TextTruncateArgs>;

export default meta;
type Story = StoryObj<TextTruncateArgs>;

export const SingleLine: Story = {};

export const FitsWithoutTruncation: Story = {
  args: {
    text: 'Short name.txt',
  },
};

export const MultiLine: Story = {
  args: {
    text:
      'This description is intentionally long enough that it will need to wrap across ' +
      'several lines before eventually being clamped once it exceeds the configured limit.',
    lines: 3,
    width: 260,
  },
};

export const InAList: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.flexDirection = 'column';
    demo.style.gap = '8px';
    demo.style.width = '200px';

    const files = [
      'budget.xlsx',
      'quarterly-financial-summary-and-projections-2026.pdf',
      'notes.txt',
      'vacation-photo-from-the-trip-to-the-mountains.jpg',
    ];

    for (const name of files) {
      const textTruncate = document.createElement('gnome-text-truncate');
      textTruncate.textContent = name;
      demo.append(textTruncate);
    }

    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './kbd';

interface KbdArgs {
  keyName: string;
  raw: boolean;
}

function renderKbd(args: KbdArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const kbd = document.createElement('gnome-kbd');
  kbd.textContent = args.keyName;
  kbd.toggleAttribute('raw', args.raw);

  demo.append(kbd);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Kbd',
  component: 'gnome-kbd',
  tags: ['autodocs'],
  render: renderKbd,
  args: {
    keyName: 'Enter',
    raw: false,
  },
  argTypes: {
    keyName: {
      control: 'text',
      description:
        'The key name, authored as the element’s light-DOM text (e.g. "Enter", "Esc", "A").',
    },
    raw: {
      control: 'boolean',
      description: 'Show the raw key name instead of its normalised Unicode symbol.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Standalone single key-cap for inline instructional text (e.g. "Press <kbd>Enter</kbd> to continue"). Common key names are normalised to their Unicode symbol unless `raw` is set; the original name moves to `aria-label` so assistive tech still announces "Enter" rather than "↵".',
      },
    },
  },
} satisfies Meta<KbdArgs>;

export default meta;
type Story = StoryObj<KbdArgs>;

export const Default: Story = {};

export const RawText: Story = {
  args: {
    keyName: 'Enter',
    raw: true,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '`raw` shows the raw key name instead of its Unicode glyph.',
      },
    },
  },
};

export const CommonKeys: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.flexWrap = 'wrap';
    row.style.gap = '8px';

    for (const key of ['Enter', 'Esc', 'Tab', 'Shift', 'Ctrl', 'Delete', 'Space', 'A', 'F5']) {
      const kbd = document.createElement('gnome-kbd');
      kbd.textContent = key;
      row.append(kbd);
    }

    demo.append(row);
    story.append(demo);

    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'A range of common keys showing symbol normalisation. Unknown keys (e.g. "F5") render as-is.',
      },
    },
  },
};

export const InlineInProse: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const paragraph = document.createElement('p');
    paragraph.style.maxWidth = '420px';
    paragraph.style.lineHeight = '1.6';

    function kbd(key: string) {
      const el = document.createElement('gnome-kbd');
      el.textContent = key;
      return el;
    }

    paragraph.append(
      'Press ',
      kbd('Enter'),
      ' to confirm, or ',
      kbd('Esc'),
      ' to cancel. Hold ',
      kbd('Shift'),
      ' while dragging to select multiple files.',
    );

    demo.append(paragraph);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

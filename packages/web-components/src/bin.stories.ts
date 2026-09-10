import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './bin';

function renderBin() {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const bin = document.createElement('gnome-bin');
  bin.textContent = 'Just a child, no chrome of its own';

  demo.append(bin);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Bin',
  component: 'gnome-bin',
  tags: ['autodocs'],
  render: renderBin,
  parameters: {
    docs: {
      description: {
        component:
          'Single-child container with no visual styling of its own — mirrors `AdwBin`. Pure CSS host; the only rule it ships is `display: block`, matching a plain `<div>`. Use it as a neutral base for layout/size constraints without introducing any chrome.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Interactive: Story = {};

export const AppliesConsumerStyling: Story = {
  name: 'Applies consumer styling',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const bin = document.createElement('gnome-bin');
    bin.style.maxWidth = '220px';
    bin.style.padding = '12px';
    bin.style.border = '1px solid #c0c0c0';
    bin.textContent =
      'This text wraps at 220px because the bin around it was given a max-width — the border here comes entirely from the style attribute, not from gnome-bin itself.';

    demo.append(bin);
    story.append(demo);

    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'gnome-bin adds nothing visual — every constraint here comes from consumer CSS.',
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

    demo.append(document.createElement('gnome-bin'));
    story.append(demo);

    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'No children, no attributes — an empty block-level box, same as a bare `<div>`.',
      },
    },
  },
};

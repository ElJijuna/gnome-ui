import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import readme from './README.md?raw';
import { ScrollToTop } from './ScrollToTop';

const meta: Meta<typeof ScrollToTop> = {
  title: 'Components/ScrollToTop',
  component: ScrollToTop,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    visible: {
      control: 'select',
      options: ['always', 'auto'],
      description: 'Show always or only after scrolling past the threshold.',
    },
    position: {
      control: 'select',
      options: [
        'bottom-right',
        'bottom-left',
        'bottom-center',
        'top-right',
        'top-left',
        'top-center',
      ],
      description: 'Corner or edge where the button is anchored.',
    },
    threshold: {
      control: 'number',
      description: 'Pixels scrolled before the button appears (only in `auto` mode).',
    },
  },
  args: {
    visible: 'always',
    position: 'bottom-right',
    threshold: 300,
  },
};

export default meta;
type Story = StoryObj<typeof ScrollToTop>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── All Positions ────────────────────────────────────────────────────────────

/** All six anchor positions rendered simultaneously. */
export const AllPositions: Story = {
  render: () => (
    <div style={{ position: 'relative', height: '200px' }}>
      {(
        [
          'bottom-right',
          'bottom-left',
          'bottom-center',
          'top-right',
          'top-left',
          'top-center',
        ] as const
      ).map((position) => (
        <ScrollToTop key={position} visible="always" position={position} />
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All six position variants shown simultaneously.',
      },
    },
  },
};

// ─── Auto Visibility ──────────────────────────────────────────────────────────

/** Scroll the box below to see the button appear after 150 px. */
export const AutoVisibility: Story = {
  args: { visible: 'auto', threshold: 150, position: 'bottom-right' },
  render: (args) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
      <div style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          style={{
            height: '300px',
            overflowY: 'auto',
            border: '1px solid var(--gnome-borders-color, #ccc)',
            borderRadius: 'var(--gnome-radius-md, 8px)',
            padding: '16px',
          }}
        >
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} style={{ margin: '0 0 12px' }}>
              Line {i + 1} — scroll down to reveal the button.
            </p>
          ))}
        </div>
        <ScrollToTop {...args} scrollTarget={containerRef.current ?? undefined} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Scroll the container below 150 px to see the button appear. Uses `scrollTarget` to observe an element instead of `window`.',
      },
    },
  },
};

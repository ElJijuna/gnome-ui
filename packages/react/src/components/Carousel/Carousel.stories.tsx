import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Carousel, CarouselIndicatorDots, CarouselIndicatorLines } from './Carousel';
import readme from './README.md?raw';

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: { component: readme },
    },
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    loop: { control: 'boolean' },
    spacing: { control: { type: 'number', min: 0, max: 48, step: 4 } },
    visibleSlides: { control: { type: 'number', min: 1, max: 3, step: 0.5 } },
    // managed internally by each story
    page: { table: { disable: true } },
    onPageChanged: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    orientation: 'horizontal',
    loop: false,
    spacing: 0,
    visibleSlides: 1,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

const COLORS = ['#3584e4', '#e01b24', '#33d17a', '#ff7800', '#9141ac'];
const LABELS = ['Blue', 'Red', 'Green', 'Orange', 'Purple'];

const SlidePlaceholder = ({ label, color }: { label: string; color: string }) => (
  <div
    style={{
      height: 200,
      background: color,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '1.25rem',
      fontWeight: 700,
      userSelect: 'none',
    }}
  >
    {label}
  </div>
);

// ─── WithDots ─────────────────────────────────────────────────────────────────

export const WithDots: Story = {
  render: (args) => {
    const [page, setPage] = useState(0);
    const isVertical = args.orientation === 'vertical';

    return (
      <div style={isVertical ? { display: 'flex', gap: 8, alignItems: 'flex-start' } : undefined}>
        <Carousel
          {...args}
          page={page}
          onPageChanged={setPage}
          style={isVertical ? { height: 200 } : undefined}
        >
          {COLORS.map((c, i) => (
            <SlidePlaceholder key={i} label={LABELS[i]} color={c} />
          ))}
        </Carousel>
        <CarouselIndicatorDots
          pages={COLORS.length}
          currentPage={page}
          onPageSelected={setPage}
          style={isVertical ? { flexDirection: 'column', padding: '0 12px' } : undefined}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Carousel paired with `CarouselIndicatorDots`. Use the controls panel to explore `orientation`, `spacing`, `visibleSlides`, and `loop`.',
      },
    },
  },
};

// ─── WithLines ────────────────────────────────────────────────────────────────

export const WithLines: Story = {
  render: (args) => {
    const [page, setPage] = useState(0);
    const isVertical = args.orientation === 'vertical';

    return (
      <div style={isVertical ? { display: 'flex', gap: 8, alignItems: 'flex-start' } : undefined}>
        <Carousel
          {...args}
          page={page}
          onPageChanged={setPage}
          style={isVertical ? { height: 200 } : undefined}
        >
          {COLORS.map((c, i) => (
            <SlidePlaceholder key={i} label={LABELS[i]} color={c} />
          ))}
        </Carousel>
        <CarouselIndicatorLines
          pages={COLORS.length}
          currentPage={page}
          onPageSelected={setPage}
          style={isVertical ? { flexDirection: 'column', padding: '0 12px' } : undefined}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Same carousel with `CarouselIndicatorLines` — preferred for longer decks. All controls apply.',
      },
    },
  },
};

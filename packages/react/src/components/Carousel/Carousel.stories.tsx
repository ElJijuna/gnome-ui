import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ComponentProps } from 'react';

import { Carousel, CarouselIndicatorDots, CarouselIndicatorLines } from './Carousel';
import readme from './README.md?raw';

type CarouselStoryArgs = ComponentProps<typeof Carousel> & {
  indicator: 'dots' | 'lines' | 'none';
};

const meta: Meta<CarouselStoryArgs> = {
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
    indicator: {
      control: 'select',
      options: ['dots', 'lines', 'none'],
      description: 'Page indicator style rendered alongside the carousel.',
    },
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
    indicator: 'dots',
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
type Story = StoryObj<CarouselStoryArgs>;

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

const CarouselWithIndicator = ({
  indicator,
  ...args
}: CarouselStoryArgs) => {
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
      {indicator === 'dots' && (
        <CarouselIndicatorDots
          pages={COLORS.length}
          currentPage={page}
          onPageSelected={setPage}
          style={isVertical ? { flexDirection: 'column', padding: '0 12px' } : undefined}
        />
      )}
      {indicator === 'lines' && (
        <CarouselIndicatorLines
          pages={COLORS.length}
          currentPage={page}
          onPageSelected={setPage}
          style={isVertical ? { flexDirection: 'column', padding: '0 12px' } : undefined}
        />
      )}
    </div>
  );
};

// ─── WithDots ─────────────────────────────────────────────────────────────────

export const WithDots: Story = {
  render: (args) => <CarouselWithIndicator {...args} />,
  args: { indicator: 'dots' },
  parameters: {
    docs: {
      description: {
        story:
          'Carousel paired with `CarouselIndicatorDots`. Use the **indicator** control to switch to lines or hide the indicator entirely.',
      },
    },
  },
};

// ─── WithLines ────────────────────────────────────────────────────────────────

export const WithLines: Story = {
  render: (args) => <CarouselWithIndicator {...args} />,
  args: { indicator: 'lines' },
  parameters: {
    docs: {
      description: {
        story:
          'Same carousel with `CarouselIndicatorLines` — preferred for longer decks. All controls apply.',
      },
    },
  },
};

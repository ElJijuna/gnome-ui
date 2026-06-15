import type { Meta, StoryObj } from '@storybook/react';
import { type ComponentProps } from 'react';

import { Carousel } from './Carousel';
import readme from './README.md?raw';

type Story = StoryObj<ComponentProps<typeof Carousel>>;

const meta: Meta<ComponentProps<typeof Carousel>> = {
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
    autoPlay: { control: 'boolean' },
    interval: { control: { type: 'number', min: 500, max: 10000, step: 500 } },
    indicator: {
      control: 'select',
      options: ['dots', 'lines', 'none'],
      description: 'Page indicator style rendered alongside the carousel.',
    },
    indicatorPosition: {
      control: 'select',
      options: ['bottom', 'top', 'left', 'right'],
      description: 'Where the indicator appears relative to the carousel.',
    },
    page: { table: { disable: true } },
    onPageChanged: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    orientation: 'horizontal',
    loop: false,
    spacing: 0,
    visibleSlides: 1,
    autoPlay: false,
    interval: 3000,
    indicator: 'dots',
    indicatorPosition: 'bottom',
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

const renderCarousel = (args: ComponentProps<typeof Carousel>) => (
  <Carousel
    {...args}
    style={args.orientation === 'vertical' ? { height: 200, ...args.style } : args.style}
  >
    {COLORS.map((c, i) => (
      <SlidePlaceholder key={i} label={LABELS[i]} color={c} />
    ))}
  </Carousel>
);

// ─── WithDots ─────────────────────────────────────────────────────────────────

export const WithDots: Story = {
  render: renderCarousel,
  args: { indicator: 'dots', indicatorPosition: 'bottom' },
  parameters: {
    docs: {
      description: {
        story:
          'Carousel with built-in `CarouselIndicatorDots`. Use **indicator** to switch style and **indicatorPosition** to reposition it.',
      },
    },
  },
};

// ─── WithLines ────────────────────────────────────────────────────────────────

export const WithLines: Story = {
  render: renderCarousel,
  args: { indicator: 'lines', indicatorPosition: 'bottom' },
  parameters: {
    docs: {
      description: {
        story:
          'Same carousel with `CarouselIndicatorLines` — preferred for longer decks. All controls apply.',
      },
    },
  },
};

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
    visibleSlides: { control: { type: 'number', min: 1, max: 5, step: 1 } },
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
    arrows: {
      control: 'boolean',
      description: 'Show previous/next arrow buttons overlaid on the carousel edges.',
    },
    previousLabel: { control: 'text' },
    nextLabel: { control: 'text' },
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
    arrows: false,
  },
  decorators: [
    (Story, context) => (
      <div style={{ maxWidth: (context.parameters.containerWidth as number | undefined) ?? 480 }}>
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

// ─── WithArrows ───────────────────────────────────────────────────────────────

export const WithArrows: Story = {
  render: renderCarousel,
  args: { arrows: true, indicator: 'dots' },
  parameters: {
    docs: {
      description: {
        story:
          'Set **arrows** to overlay previous/next buttons on the carousel edges. They are disabled at the first and last page unless **loop** is on, and hidden entirely when there is only one page. Combine with `indicator: "none"` for arrows-only navigation.',
      },
    },
  },
};

// ─── ArrowsOnly ───────────────────────────────────────────────────────────────

export const ArrowsOnly: Story = {
  render: renderCarousel,
  args: { arrows: true, indicator: 'none', loop: true },
  parameters: {
    docs: {
      description: {
        story: 'Arrows without dots. With **loop** on, neither arrow ever disables.',
      },
    },
  },
};

// ─── MultipleVisibleSlides ────────────────────────────────────────────────────

export const MultipleVisibleSlides: Story = {
  render: renderCarousel,
  args: { visibleSlides: 2, spacing: 12, arrows: true, indicator: 'dots' },
  parameters: {
    containerWidth: 640,
    docs: {
      description: {
        story:
          'Use **visibleSlides** to show several children inside the viewport at once. Navigation advances a full group at a time and the indicator renders `ceil(slides / visibleSlides)` dots — here 5 slides in groups of 2 give 3 pages.',
      },
    },
  },
};

// ─── CardSlides ───────────────────────────────────────────────────────────────

/** Inline SVG placeholder so the story never depends on a network image. */
const photo = (from: string, to: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
      `</linearGradient></defs>` +
      `<rect width="320" height="240" fill="url(#g)"/>` +
      `<circle cx="245" cy="62" r="26" fill="#fff" fill-opacity=".5"/>` +
      `<path d="M0 240L96 126l70 74 46-44 108 84z" fill="#fff" fill-opacity=".32"/>` +
      `</svg>`,
  )}`;

const CARDS = [
  {
    eyebrow: 'Adaptive',
    title: 'Fits every screen',
    body: 'Layouts reflow from mobile to desktop without a single media query of your own.',
    image: photo('#3584e4', '#62a0ea'),
  },
  {
    eyebrow: 'Accessible',
    title: 'Keyboard first',
    body: 'Arrow keys page the carousel, dots are real tabs and every control is reachable.',
    image: photo('#e01b24', '#ff7800'),
  },
  {
    eyebrow: 'Themeable',
    title: 'Follows your tokens',
    body: 'Colors, radii and spacing all read from GNOME design tokens, light or dark.',
    image: photo('#2ec27e', '#33d17a'),
  },
];

const SlideCard = ({ eyebrow, title, body, image }: (typeof CARDS)[number]) => (
  <article
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: 220,
      overflow: 'hidden',
      borderRadius: 12,
      border: '1px solid var(--gnome-border-color, rgb(0 0 0 / 0.1))',
      background: 'var(--gnome-card-bg-color, #fff)',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
        // Extra inline-start gutter keeps the overlaid arrow off the copy.
        padding: '20px 20px 20px 52px',
      }}
    >
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        {eyebrow}
      </span>
      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, opacity: 0.75 }}>{body}</p>
    </div>
    <img
      src={image}
      alt=""
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </article>
);

export const CardSlides: Story = {
  render: (args) => (
    <Carousel {...args}>
      {CARDS.map((card) => (
        <SlideCard key={card.title} {...card} />
      ))}
    </Carousel>
  ),
  args: { arrows: true, indicator: 'dots', loop: true, spacing: 16 },
  parameters: {
    containerWidth: 600,
    docs: {
      description: {
        story:
          'Split cards as slides: text on the left half, image on the right half. Each slide is a plain `<article>` with `grid-template-columns: 1fr 1fr` — the carousel imposes no markup of its own on the children.',
      },
    },
  },
};

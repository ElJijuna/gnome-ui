import type { Meta, StoryObj } from '@storybook/react';
import { type ComponentProps, useRef, useState } from 'react';

import { Carousel, type CarouselHandle } from './Carousel';
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
    infinite: {
      control: 'boolean',
      description: 'Seamless circular motion — clones a page at each end instead of rewinding.',
    },
    peek: {
      control: 'text',
      description:
        'How much of the neighbouring slides shows at each edge (px number or CSS length).',
    },
    focusActiveSlides: {
      control: 'boolean',
      description: 'Shrink the slides outside the current page to 80%, focusing the active ones.',
    },
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
    autoPlayControl: {
      control: 'boolean',
      description: 'Render the play/pause button while `autoPlay` is on (WCAG 2.2.2).',
    },
    label: { control: 'text', description: 'Accessible name for the carousel region.' },
    indicatorLabel: { control: 'text' },
    previousLabel: { control: 'text' },
    nextLabel: { control: 'text' },
    pauseLabel: { control: 'text' },
    playLabel: { control: 'text' },
    pageLabel: { table: { disable: true } },
    slideLabel: { table: { disable: true } },
    defaultPage: { control: { type: 'number', min: 0, max: 4, step: 1 } },
    page: { table: { disable: true } },
    onPageChanged: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    orientation: 'horizontal',
    loop: false,
    infinite: false,
    peek: 0,
    focusActiveSlides: false,
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

// ─── ImperativeControl ────────────────────────────────────────────────────────

const ImperativeDemo = (args: ComponentProps<typeof Carousel>) => {
  const ref = useRef<CarouselHandle>(null);
  const [readout, setReadout] = useState('page 1 of 5');

  const report = () =>
    setReadout(`page ${(ref.current?.page ?? 0) + 1} of ${ref.current?.pageCount ?? 0}`);

  const act = (fn: () => void) => () => {
    fn();
    // The getters are live, so the readout is right before the next render.
    report();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {renderCarousel({ ...args, ref })}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={act(() => ref.current?.previous())}>
          previous()
        </button>
        <button type="button" onClick={act(() => ref.current?.next())}>
          next()
        </button>
        <button type="button" onClick={act(() => ref.current?.goTo(0))}>
          goTo(0)
        </button>
        <button type="button" onClick={act(() => ref.current?.goToSlide(4))}>
          goToSlide(4)
        </button>
        <button type="button" onClick={act(() => ref.current?.focus())}>
          focus()
        </button>
        <output style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{readout}</output>
      </div>
    </div>
  );
};

export const ImperativeControl: Story = {
  render: (args) => <ImperativeDemo {...args} />,
  args: { indicator: 'dots', loop: true },
  parameters: {
    docs: {
      description: {
        story:
          'Drive the carousel from outside with a `ref`. Every method takes the same path as the arrows and the dots, so wrapping, cloned-page travel and reduced motion behave the same however the move started — and `page`, `pageCount` and `isPlaying` are live getters, correct on the line after the call rather than after the next render.',
      },
    },
  },
};

// ─── RightToLeft ──────────────────────────────────────────────────────────────

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      {renderCarousel({ ...args, label: 'معرض الصور', indicatorLabel: 'Carousel pages' })}
    </div>
  ),
  args: { arrows: true, indicator: 'dots' },
  parameters: {
    docs: {
      description: {
        story:
          'Direction is read off the DOM, so a `dir="rtl"` anywhere up the tree is enough. Paging runs right to left, the arrows swap sides and flip their chevrons, dragging is mirrored, and ←/→ follow what the eye sees — the **left** arrow key moves forward.',
      },
    },
  },
};

// ─── AutoPlay ─────────────────────────────────────────────────────────────────

export const AutoPlay: Story = {
  render: renderCarousel,
  args: { autoPlay: true, interval: 2000, indicator: 'dots', loop: true },
  parameters: {
    docs: {
      description: {
        story:
          'Set **autoPlay** to rotate the deck on its own. A pause button is overlaid in the corner — automatically moving content has to be stoppable (WCAG 2.2.2). Rotation also pauses while the pointer is over the carousel, while the keyboard is inside it, during a drag, and while the tab is in the background. Turn **autoPlayControl** off only when you render your own control.',
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
        padding: 20,
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
  args: { arrows: true, indicator: 'dots', infinite: true, peek: 32, spacing: 16 },
  parameters: {
    containerWidth: 680,
    docs: {
      description: {
        story:
          'Split cards as slides: text on the left half, image on the right half. Each slide is a plain `<article>` with `grid-template-columns: 1fr 1fr` — the carousel imposes no markup of its own on the children. **peek** shows the edge of the next card so the deck reads as a deck, and it doubles as a gutter that keeps the overlaid arrows off the copy.',
      },
    },
  },
};

// ─── FocusActiveSlides ────────────────────────────────────────────────────────

export const FocusActiveSlides: Story = {
  render: (args) => (
    <Carousel {...args}>
      {[...COLORS, ...COLORS].map((c, i) => (
        <SlidePlaceholder key={i} label={`${LABELS[i % LABELS.length]} ${i + 1}`} color={c} />
      ))}
    </Carousel>
  ),
  args: {
    focusActiveSlides: true,
    peek: 96,
    spacing: 16,
    infinite: true,
    arrows: true,
    indicator: 'dots',
  },
  parameters: {
    containerWidth: 720,
    docs: {
      description: {
        story:
          'With **focusActiveSlides**, everything outside the current page shrinks to 80% and animates back up as it becomes active. It only shows when the neighbours are on screen, so pair it with **peek**. Pass a number instead of `true` for a subtler ratio, e.g. `focusActiveSlides={0.92}`. The scale is a transform, so layout and paging are untouched.',
      },
    },
  },
};

// ─── Infinite ─────────────────────────────────────────────────────────────────

export const Infinite: Story = {
  render: renderCarousel,
  args: { infinite: true, arrows: true, indicator: 'dots', spacing: 12 },
  parameters: {
    docs: {
      description: {
        story:
          'With **infinite**, a copy of the last page is rendered before the first one (and vice versa), so paging past either end keeps moving in the same direction instead of rewinding across the whole deck. The carousel repositions onto the real page once the animation settles — try clicking next from *Purple* or previous from *Blue*. Clones are `aria-hidden` and `inert`, so screen readers and the tab order still see exactly five slides.',
      },
    },
  },
};

// ─── WithPeek ─────────────────────────────────────────────────────────────────

export const WithPeek: Story = {
  render: renderCarousel,
  args: { peek: '10%', infinite: true, spacing: 12, indicator: 'dots' },
  parameters: {
    docs: {
      description: {
        story:
          'Set **peek** to reveal the neighbouring slides at both edges — `"10%"` of the viewport here, but any CSS length or a px number works. The active group shrinks to make room, so paging still advances exactly one group. Pair it with **infinite** so the leading edge is never empty on the first page.',
      },
    },
  },
};

// ─── PeekWithMultipleSlides ───────────────────────────────────────────────────

export const PeekWithMultipleSlides: Story = {
  render: (args) => (
    <Carousel {...args}>
      {[...COLORS, ...COLORS].map((c, i) => (
        <SlidePlaceholder key={i} label={`${LABELS[i % LABELS.length]} ${i + 1}`} color={c} />
      ))}
    </Carousel>
  ),
  args: {
    visibleSlides: 2,
    peek: 40,
    spacing: 12,
    infinite: true,
    arrows: true,
    indicator: 'dots',
  },
  parameters: {
    containerWidth: 640,
    docs: {
      description: {
        story:
          '**peek** and **visibleSlides** compose: two full slides plus 40px of the previous and next ones. Ten slides in groups of two give five pages, and the group count divides evenly so the infinite wrap is perfectly seamless.',
      },
    },
  },
};

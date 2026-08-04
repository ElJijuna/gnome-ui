import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './rating-stars';
import type { GnomeRatingStarsElement } from './rating-stars';

interface RatingStarsArgs {
  value: number;
  max: number;
  size: 'sm' | 'md' | 'lg';
  readonly: boolean;
  disabled: boolean;
}

function renderRatingStars(args: RatingStarsArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const ratingStars = document.createElement('gnome-rating-stars') as GnomeRatingStarsElement;
  ratingStars.value = args.value;
  ratingStars.max = args.max;
  ratingStars.size = args.size;
  ratingStars.readonly = args.readonly;
  ratingStars.disabled = args.disabled;

  demo.append(ratingStars);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Rating Stars',
  component: 'gnome-rating-stars',
  tags: ['autodocs'],
  render: renderRatingStars,
  args: {
    value: 3,
    max: 5,
    size: 'md',
    readonly: false,
    disabled: false,
  },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 10, step: 1 } },
    max: { control: { type: 'number', min: 1, max: 10, step: 1 } },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    readonly: {
      control: 'boolean',
      description: 'Static role="img" display instead of an interactive radiogroup.',
    },
    disabled: {
      control: 'boolean',
      description: 'Forces the same read-only display as readonly.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Star rating display and input. Fully host-generated from `max`. Renders an interactive `role="radiogroup"` of roving-tabindex `role="radio"` stars unless `readonly` (or `disabled`) is set, in which case it renders a static `role="img"`. Picking a star sets `value` and fires `gnome-change`.',
      },
    },
  },
} satisfies Meta<RatingStarsArgs>;

export default meta;
type Story = StoryObj<RatingStarsArgs>;

export const ReadOnly: Story = {
  args: { value: 4, readonly: true },
};

export const Interactive: Story = {
  render: (args) => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.flexDirection = 'column';
    demo.style.gap = '8px';
    demo.style.alignItems = 'center';

    const output = document.createElement('p');
    output.className = 'wc-story__event';
    output.setAttribute('aria-live', 'polite');
    output.textContent = `Current rating: ${args.value}`;

    const ratingStars = document.createElement('gnome-rating-stars') as GnomeRatingStarsElement;
    ratingStars.value = args.value;
    ratingStars.max = args.max;
    ratingStars.size = args.size;

    ratingStars.addEventListener('gnome-change', (event) => {
      output.textContent = `Current rating: ${event.detail.value}`;
    });

    demo.append(ratingStars, output);
    story.append(demo);

    return story;
  },
  args: { value: 3 },
  parameters: { controls: { disable: true } },
};

export const Sizes: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.flexDirection = 'column';
    demo.style.gap = '10px';

    for (const [size, label] of [
      ['sm', 'Small rating'],
      ['md', 'Medium rating'],
      ['lg', 'Large rating'],
    ] as const) {
      const ratingStars = document.createElement('gnome-rating-stars') as GnomeRatingStarsElement;
      ratingStars.value = 4;
      ratingStars.readonly = true;
      ratingStars.size = size;
      ratingStars.setAttribute('aria-label', label);
      demo.append(ratingStars);
    }

    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Disabled: Story = {
  args: { value: 3, disabled: true },
};

export const ReviewsList: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.flexDirection = 'column';
    demo.style.gap = '10px';

    const reviews = [
      { name: 'GNOME Text Editor', rating: 5 },
      { name: 'GNOME Files', rating: 4 },
      { name: 'GNOME Web', rating: 3 },
    ];

    for (const { name, rating } of reviews) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '8px';

      const label = document.createElement('span');
      label.textContent = name;

      const ratingStars = document.createElement('gnome-rating-stars') as GnomeRatingStarsElement;
      ratingStars.value = rating;
      ratingStars.readonly = true;
      ratingStars.size = 'sm';
      ratingStars.setAttribute('aria-label', `${name}: ${rating} out of 5`);

      row.append(label, ratingStars);
      demo.append(row);
    }

    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

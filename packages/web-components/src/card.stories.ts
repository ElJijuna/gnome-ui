import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './card';

interface CardArgs {
  interactive: boolean;
  padding: 'lg' | 'md' | 'none' | 'sm';
}

function renderCardBody() {
  const title = document.createElement('strong');
  title.textContent = 'Card title';

  const body = document.createElement('p');
  body.style.marginTop = '4px';
  body.style.opacity = '0.6';
  body.textContent = 'This is a static card that groups related content on an elevated surface.';

  const fragment = document.createDocumentFragment();
  fragment.append(title, body);
  return fragment;
}

function renderStory(args: CardArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.maxWidth = '400px';
  demo.style.padding = '0';

  const card = document.createElement('gnome-card');
  card.padding = args.padding;
  card.interactive = args.interactive;
  card.append(renderCardBody());

  demo.append(card);
  story.append(demo);
  return story;
}

const meta = {
  title: 'Web Components/Card',
  component: 'gnome-card',
  tags: ['autodocs'],
  render: renderStory,
  args: {
    interactive: false,
    padding: 'md',
  },
  argTypes: {
    interactive: { control: 'boolean' },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Elevated surface for grouping related content. Set interactive for a real <button data-slot="card-surface"> to be generated around the content.',
      },
    },
  },
} satisfies Meta<CardArgs>;

export default meta;
type Story = StoryObj<CardArgs>;

export const Default: Story = {};

export const Interactive: Story = {
  args: { interactive: true },
  render: (args) => {
    const story = renderStory(args);
    const card = story.querySelector('gnome-card');
    const title = card?.querySelector('strong');
    const body = card?.querySelector('p');

    if (title) {
      title.textContent = 'Clickable card';
    }

    if (body) {
      body.textContent =
        'Rendered as a real <button>. Hover and click to see the activatable states.';
    }

    card?.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('[data-slot="card-surface"]')) {
        window.alert('Card clicked');
      }
    });

    return story;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive cards compose a real <button> for correct keyboard navigation and screen reader support.',
      },
    },
  },
};

export const PaddingSizes: Story = {
  name: 'Padding sizes',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.gap = '16px';
    demo.style.padding = '0';

    const sizes: CardArgs['padding'][] = ['none', 'sm', 'md', 'lg'];

    for (const size of sizes) {
      const card = document.createElement('gnome-card');
      card.padding = size;

      const label = document.createElement('span');
      label.style.opacity = '0.6';
      label.textContent = `padding="${size}"`;
      card.append(label);

      demo.append(card);
    }

    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

export const WithAction: Story = {
  name: 'With action',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.maxWidth = '400px';
    demo.style.padding = '0';

    const card = document.createElement('gnome-card');

    const title = document.createElement('strong');
    title.textContent = 'Storage almost full';

    const body = document.createElement('p');
    body.style.margin = '4px 0 16px';
    body.style.opacity = '0.6';
    body.textContent =
      'You have used 18.3 GB of your 20 GB quota. Free up space to continue syncing files.';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.justifyContent = 'flex-end';

    const later = document.createElement('button');
    later.type = 'button';
    later.textContent = 'Later';

    const manage = document.createElement('button');
    manage.type = 'button';
    manage.textContent = 'Manage Storage';

    actions.append(later, manage);
    card.append(title, body, actions);
    demo.append(card);
    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

export const InteractiveGrid: Story = {
  name: 'Grid of interactive cards',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'grid';
    demo.style.gridTemplateColumns = 'repeat(2, 1fr)';
    demo.style.gap = '12px';
    demo.style.maxWidth = '480px';
    demo.style.padding = '0';

    for (const label of ['Files', 'Music', 'Photos', 'Videos']) {
      const card = document.createElement('gnome-card');
      card.interactive = true;

      const title = document.createElement('strong');
      title.textContent = label;

      const caption = document.createElement('span');
      caption.style.display = 'block';
      caption.style.marginTop = '2px';
      caption.style.fontSize = '0.8125rem';
      caption.style.opacity = '0.6';
      caption.textContent = 'Open app';

      card.append(title, caption);
      demo.append(card);
    }

    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

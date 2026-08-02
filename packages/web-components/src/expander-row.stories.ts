import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './action-row';
import './expander-row';

interface ExpanderRowArgs {
  expanded: boolean;
  subtitle: string;
  suffix: string;
  title: string;
}

function renderExpanderRow(args: ExpanderRowArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '100%';
  demo.style.maxWidth = '32rem';

  const card = document.createElement('div');
  card.style.border = '1px solid var(--gnome-card-shade-color, rgb(0 0 0 / 0.12))';
  card.style.borderRadius = 'var(--gnome-radius-md, 8px)';
  card.style.overflow = 'hidden';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Expanded: ${args.expanded}`;

  const expanderRow = document.createElement('gnome-expander-row');
  expanderRow.expanded = args.expanded;

  const title = document.createElement('span');
  title.dataset.slot = 'row-title';
  title.textContent = args.title;

  const subtitle = document.createElement('span');
  subtitle.dataset.slot = 'row-subtitle';
  subtitle.textContent = args.subtitle;

  expanderRow.append(title, subtitle);

  if (args.suffix) {
    const suffix = document.createElement('span');
    suffix.dataset.slot = 'row-suffix';
    suffix.textContent = args.suffix;
    expanderRow.append(suffix);
  }

  for (const [rowTitle, rowSubtitle] of [
    ['Enable telemetry', 'Share anonymous usage data'],
    ['Hardware acceleration', 'Use GPU rendering when available'],
    ['Developer tools', 'Show the inspector panel'],
  ]) {
    const nestedRow = document.createElement('gnome-action-row');
    const nestedTitle = document.createElement('span');
    nestedTitle.dataset.slot = 'row-title';
    nestedTitle.textContent = rowTitle;
    const nestedSubtitle = document.createElement('span');
    nestedSubtitle.dataset.slot = 'row-subtitle';
    nestedSubtitle.textContent = rowSubtitle;
    nestedRow.append(nestedTitle, nestedSubtitle);
    expanderRow.append(nestedRow);
  }

  expanderRow.addEventListener('gnome-open-change', (event) => {
    eventOutput.textContent = `Expanded: ${(event as CustomEvent<{ open: boolean }>).detail.open}`;
  });

  card.append(expanderRow);
  demo.append(card, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Expander Row',
  component: 'gnome-expander-row',
  tags: ['autodocs'],
  render: renderExpanderRow,
  args: {
    expanded: false,
    subtitle: 'Configure additional options',
    suffix: 'Beta',
    title: 'Advanced settings',
  },
  argTypes: {
    expanded: { control: 'boolean' },
    subtitle: { control: 'text' },
    suffix: { control: 'text' },
    title: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Collapsible `gnome-action-row` that reveals nested rows on activation — mirrors `AdwExpanderRow`. Any light-DOM children beyond the header slots are moved into a generated, height-animated `role="region"` panel.',
      },
    },
  },
} satisfies Meta<ExpanderRowArgs>;

export default meta;
type Story = StoryObj<ExpanderRowArgs>;

export const Interactive: Story = {};

export const Expanded: Story = {
  args: {
    expanded: true,
  },
};

export const NoTrailing: Story = {
  args: {
    suffix: '',
    title: 'Notifications',
    subtitle: 'Manage alert preferences',
  },
};
